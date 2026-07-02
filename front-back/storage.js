// ============================================================================
// storage.js — persistance localStorage + MongoDB (LS, saveCodeCards, saveTCStore,
//              deleteFromDB, PulledBlock). Extrait de qa-agent.js.
// ============================================================================

// ── Persist ────────────────────────────────────────────────────────────────────
const LS = {
  save() {
    try {
      localStorage.setItem('qa_agent_history', JSON.stringify(chatHistory));
      // Save TC_STORE — only cards still in DOM
      const tcStoreLight = {};
      Object.keys(TC_STORE).forEach(id => {
        if (!document.getElementById(id)) return; // skip removed cards
        const s = TC_STORE[id];
        tcStoreLight[id] = { cases: s.cases, url: s.url, pages: s.pages, pageLabel: s.pageLabel };
      });
      localStorage.setItem('qa_tc_store', JSON.stringify(tcStoreLight));
      // Save generated code cards
      localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards || []));
      localStorage.setItem('qa_agent_azure',    JSON.stringify(azureSession));
      localStorage.setItem('qa_agent_jira',     JSON.stringify(jiraSession));
      localStorage.setItem('qa_agent_pending',  pendingTestCases ? JSON.stringify(pendingTestCases) : '');
      localStorage.setItem('qa_agent_lib',      document.getElementById('optLibrary').value);
      localStorage.setItem('qa_agent_style',    document.getElementById('optStyle').value);
      localStorage.setItem('qa_agent_mode',     'multi');
      const hl = document.getElementById('optHeadless'); if (hl) localStorage.setItem('qa_agent_headless', hl.value);
      const bt = document.getElementById('optBrowserType'); if (bt) localStorage.setItem('qa_agent_browser_type', bt.value);
      localStorage.setItem('qa_agent_welcomed', '1');
    } catch(e) { console.warn('localStorage unavailable — run via http://localhost', e); }
  },
  async load() {
    // Welcome message is already in index.html — no need to render it here

    try {
      // ── Selects
      const lib   = localStorage.getItem('qa_agent_lib');
      const style = localStorage.getItem('qa_agent_style');
      const mode  = localStorage.getItem('qa_agent_mode');
      if (lib)   document.getElementById('optLibrary').value = lib;
      if (style) document.getElementById('optStyle').value   = style;
      // multi mode is always default
    const headlessSaved = localStorage.getItem('qa_agent_headless'); if (headlessSaved) { const hel = document.getElementById('optHeadless'); if (hel) hel.value = headlessSaved; }
    const browserTypeSaved = localStorage.getItem('qa_agent_browser_type'); if (browserTypeSaved) { const btel = document.getElementById('optBrowserType'); if (btel) btel.value = browserTypeSaved; }
    // Mettre a jour le select navigateur quand la librairie change
    const libSel = document.getElementById('optLibrary');
    if (libSel) {
      libSel.addEventListener('change', function() { updateBrowserSelect(); });
      updateBrowserSelect();
    }

      // ── Sessions
      const az = localStorage.getItem('qa_agent_azure');
      if (az)  { try { azureSession  = JSON.parse(az); } catch(e) {} }
      const jl = localStorage.getItem('qa_agent_jira');
      if (jl)  { try { jiraSession   = JSON.parse(jl); } catch(e) {} }
      const pt = localStorage.getItem('qa_agent_pending');
      if (pt)  { try { pendingTestCases = JSON.parse(pt); } catch(e) {} }

      // ── Chat history
      const hist = localStorage.getItem('qa_agent_history');
      if (hist) {
        const parsed = JSON.parse(hist);
        if (parsed.length > 0) {
          chatHistory = parsed;
          // Marqueurs internes : ne pas afficher dans le chat
          const _internalMarkers = ['[RF code:', '[Test cases:', '[US Card #', '[Suite:', '[Run #'];
          chatHistory.forEach(m => {
            if (m.role === 'user') renderUserMsg(m.content, false);
            else if (!_internalMarkers.some(function(mk){ return m.content.startsWith(mk); }))
              renderAgentMsg(m.content, false);
          });
          // Re-render TC cards — depuis MongoDB en priorité
          let tcStored = localStorage.getItem('qa_tc_store');
          try {
            const r = await fetch('/api/storage/tcstore');
            const d = await r.json();
            if (d.ok && d.store && Object.keys(d.store).length > 0) {
              tcStored = JSON.stringify(d.store);
            }
          } catch(e) {}
          const tcStored2 = tcStored;
          Object.keys(TC_STORE).forEach(k => delete TC_STORE[k]);
          if (tcStored2) {
            try {
              const stored = JSON.parse(tcStored2);
              Object.keys(stored).forEach(cardId => {
                const s = stored[cardId];
                TC_STORE[cardId] = s;
                // Restore pages directly — don't re-derive from cases
                if (!TC_STORE[cardId].pages && s.pages) TC_STORE[cardId].pages = s.pages;
                const cases = s.pages ? s.pages.flatMap(p => p.cases||[]) : (s.cases||[]);
                if (cases.length > 0) renderTestCasesCard(cases, s.url, false, cardId);
              });
            } catch(e) {}
          } else if (pendingTestCases?.cases?.length) {
            renderTestCasesCard(pendingTestCases.cases, pendingTestCases.url, false);
          }

          // Re-render code cards — depuis MongoDB en priorité
          const loadAndRenderCards = async () => {
            // Afficher indicateur de chargement
            const _loadingDiv = document.createElement('div');
            _loadingDiv.id = '_loadingIndicator';
            _loadingDiv.className = 'msg agent';
            _loadingDiv.innerHTML = '<div class="msg-avatar">🤖</div><div class="msg-body"><div class="msg-bubble" style="padding:10px 14px;color:var(--gray);font-size:12px;font-family:monospace">' + t('store.loadingBlocks') + '</div></div>';
            const _msgs = document.getElementById('messages');
            if (_msgs) _msgs.appendChild(_loadingDiv);

            let cards = [];
            // Par defaut : source supposee saine (Mongo). Passe a true seulement si on retombe sur
            // le cache localStorage "light" (code:'') -> saveCodeCards refusera de resauver ces cartes.
            window._loadedFromLightFallback = false;
            // Retry 3x ~2s : au cold-start (Render/Atlas froid) Mongo peut ne pas etre pret -> reponse
            // vide. On re-tente avant de retomber sur le cache local. cache:'no-store' -> jamais resservir
            // une reponse vide depuis le cache. break SEULEMENT si le serveur renvoie des cards.
            for (var _attempt = 0; _attempt < 3; _attempt++) {
              try {
                const _ctrl = new AbortController();
                const _timeout = setTimeout(() => _ctrl.abort(), 5000);
                const r = await fetch('/api/storage/all', { cache: 'no-store', signal: _ctrl.signal });
                clearTimeout(_timeout);
                const d = await r.json();
                if (d.ok && d.cards?.length > 0) {
                  cards = d.cards;
                  break;
                } else if (_attempt < 2) {
                  await new Promise(function(res){ setTimeout(res, 2000); });
                }
              } catch(e) {
                if (_attempt < 2) {
                  await new Promise(function(res){ setTimeout(res, 2000); });
                }
              }
            }
            // Filet : UNIQUEMENT si le serveur n'a jamais renvoye de cards (vide/echec persistant apres
            // les 3 essais). PRIORITE Mongo : ne JAMAIS ecraser des donnees serveur par un localStorage.
            if (cards.length === 0) {
              const stored = localStorage.getItem('qa_code_cards');
              if (stored) { try { cards = JSON.parse(stored); } catch(e2) {} }
              if (cards.length > 0) {
                // GARDE ANTI-CORRUPTION : ces cartes viennent du cache localStorage "light" (code:'').
                // On marque la session -> saveCodeCards ne renverra PAS ces cartes vides a Mongo
                // (sinon elles ecraseraient le vrai code en base).
                window._loadedFromLightFallback = true;
                console.error('[ANTI-CORRUPTION] Cartes chargees depuis le fallback localStorage "light" (sans code RF) : sauvegarde Mongo de ces cartes desactivee pour proteger le code en base.');
              }
            }
            if (cards.length > 0) {
              window._codeCards = cards;
              // [BREAKPOINT FIX] one-shot : retirer les Pause Execution injectés ayant FUI dans f.code
              let _bpCleaned = false;
              (window._codeCards || []).forEach(c => (c.files || []).forEach(f => {
                if (f && typeof f.code === 'string' && f.code.indexOf('msg=🔴 Breakpoint ligne') !== -1) {
                  const _s = _bpStripInjected(f.code);
                  if (_s !== f.code) { f.code = _s; _bpCleaned = true; }
                }
              }));
              if (_bpCleaned) { try { saveCodeCards(); } catch (e) {} }
              cards.forEach(card => {
                if (card.type === 'suite-report') {
                  setTimeout(() => renderConsolidatedSuiteReport(card), 0);
                } else if (card.type === 'report') {
                  // Évite le doublon : pas de re-render si isSuite (déjà rendu via suite-report)
                  // et pas de re-render si déjà dans le DOM
                  if (!card.data?.isSuite && !document.getElementById('reportCard-' + card.data?.runNumber)) {
                    setTimeout(() => renderReportCard(card.data), 0);
                  }
                } else if (card.type === 'multi' || card.type === 'pulled' || card.files?.[0]) {
                  const files = (card.files||[]).map(f => ({
                    ...f,
                    code: (function(raw) {
                      var c = raw && raw.includes('%20') ? (function(){ try { return decodeURIComponent(raw); } catch(e) { return raw; } })() : raw;
                      return cleanRobotCodeFromHtml(c);
                    })(f.code)
                  }));
                  setTimeout(() => { window._lastGeneratedTitle = card.title || ''; renderResultCard(files, card.cardId); }, 0);
                  // Restaurer le tag si le bloc était tagué
                  if (card.tagged || card.type === 'pulled') {
                    if (!window._taggedCards) window._taggedCards = new Set();
                    window._taggedCards.add(card.cardId);
                    setTimeout(function(){
                      var btn = document.getElementById('tagBtn-' + card.cardId);
                      if (btn) { btn.style.background='rgba(192,132,252,0.18)'; btn.style.color='#c084fc'; btn.style.borderColor='#c084fc'; btn.textContent=t('codecards.tagged'); }
                    }, 500);
                  }
                }
              });
            }
            updateStatsBar();
            // Supprimer l'indicateur de chargement
            const _li = document.getElementById('_loadingIndicator');
            if (_li) _li.remove();
          };
          await loadAndRenderCards();
          // Nettoyer le HTML de coloration dans tous les blocs
          (window._codeCards||[]).forEach(function(card){
            (card.files||[]).forEach(function(f){
              if(f.code) f.code = cleanRobotCodeFromHtml(f.code);
            });
          });
          scrollToBottom();
        }
      }

      // ── Warn if running from file://
      if (window.location.protocol === 'file:') {
        setTimeout(() => {
          renderAgentMsg(t('store.localStorageDisabled'), false);
        }, 500);
      }

    } catch(e) { console.warn('LS.load error:', e); }
  },
};
// ── Suppression unifiée MongoDB + localStorage ────────────────────────────────
function deleteFromDB(cardId) {
  if (!cardId) return;
  fetch('/api/storage/card/' + cardId, { method: 'DELETE' })
    .catch(e => console.warn('MongoDB delete error:', e.message));
  // Supprimer aussi de pulledblocks si c'est un bloc pullé
  fetch('/api/pulledblocks/' + encodeURIComponent(cardId), { method: 'DELETE' })
    .catch(function(){});
}
function deleteTCFromDB() {
  saveTCStore(); // re-sauvegarde sans les blocs supprimés
}
function saveCodeCards() {
  updateStatsBar();
  // ── GARDE ANTI-CORRUPTION ───────────────────────────────────────────────────
  // Si la session a ete chargee du fallback localStorage "light" (code:''), NE PAS renvoyer
  // ces cartes vides a Mongo : elles ECRASERAIENT le vrai code en base. Critere PRIMAIRE = le
  // flag d'origine fallback (sûr). On filtre alors les cartes "light corrompues" (multi/single
  // dont TOUS les files ont un code vide) — tout en laissant passer les cartes NEUVES (code reel)
  // creees apres le chargement. Le check "code vide" n'est applique QUE si le flag est leve
  // (donc aucun faux positif sur un fichier volontairement vide en session Mongo normale).
  const _isLightCorrupted = (c) =>
    (c.type === 'multi' || c.type === 'single') &&
    (c.files || []).length > 0 &&
    (c.files || []).every(f => !f.code || f.code === '');
  let cardsToSave = window._codeCards || [];
  if (window._loadedFromLightFallback) {
    const suspects = cardsToSave.filter(_isLightCorrupted);
    if (suspects.length) {
      console.error('[ANTI-CORRUPTION] saveCodeCards : ' + suspects.length +
        ' carte(s) issue(s) du fallback localStorage "light" (code vide) NON envoyee(s) a Mongo ' +
        '(protection du code en base). cardIds: ' + suspects.map(c => c.cardId).join(', '));
    }
    cardsToSave = cardsToSave.filter(c => !_isLightCorrupted(c));
  }
  // Sauvegarde MongoDB (principal) — seulement s'il reste au moins une carte saine a sauver.
  // (L'endpoint upsert par cardId : omettre une carte ne la supprime PAS de Mongo -> code preserve.)
  if (cardsToSave.length) {
    fetch('/api/storage/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: cardsToSave }),
    }).catch(e => console.warn('MongoDB save error:', e.message));
  }
  // localStorage fallback léger (sans code RF)
  try {
    const light = (window._codeCards||[]).map(c => {
      if (c.type !== 'multi' && c.type !== 'single') return c;
      return { ...c, files: (c.files||[]).map(f => ({ ...f, code: '' })) };
    });
    localStorage.setItem('qa_code_cards', JSON.stringify(light));
  } catch(e) {}
}
function saveTCStore() {
  try {
    const light = {};
    Object.keys(TC_STORE).forEach(id => {
      const s = TC_STORE[id];
      if (!s) return;
      light[id] = { cases: s.cases, url: s.url, pages: s.pages, pageLabel: s.pageLabel };
    });
    localStorage.setItem('qa_tc_store', JSON.stringify(light));
    // Sauvegarde aussi dans MongoDB
    fetch('/api/storage/tcstore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store: light }),
    }).catch(e => console.warn('MongoDB TCStore error:', e.message));
  } catch(e) { console.error('[saveTCStore] error', e); }
}
// ── PulledBlock persistence ──────────────────────────────────────────────────

// _patchPulledBlock / _loadPulledBlocks étaient des doublons identiques au découpage : une seule copie conservée.
function _savePulledBlock(blockId, source, files, tagged) {
  var provider = 'gitlab';
  if (source && source.toLowerCase().includes('azure')) provider = 'azure';
  else if (source && source.toLowerCase().includes('jenkins')) provider = 'jenkins';
  var payload = {
    blockId:  blockId,
    source:   source || blockId,
    provider: provider,
    files:    files.map(function(f){ return { filename: f.filename, code: f.code, label: f.label||'' }; }),
    tagged:   tagged || false,
  };
  fetch('/api/pulledblocks', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  }).catch(function(e){ console.warn('[PulledBlock] save error', e); });
}

function _patchPulledBlock(blockId, update) {
  fetch('/api/pulledblocks/' + encodeURIComponent(blockId), {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(update),
  }).catch(function(e){ console.warn('[PulledBlock] patch error', e); });
}

async function _loadPulledBlocks() {
  try {
    var res  = await fetch('/api/pulledblocks');
    var data = await res.json();
    if (!data.ok || !data.blocks || !data.blocks.length) return;
    data.blocks.forEach(function(b) {
      // Ne pas re-rendre si le bloc est déjà affiché
      if (document.getElementById(b.blockId)) return;
      var rf = b.files.map(function(f){ return { filename: f.filename, code: f.code, label: f.label||'' }; });
      renderResultCard(rf, b.blockId);
      var c = (window._codeCards||[]).find(function(x){ return x.cardId === b.blockId; });
      if (c) {
        c.title = b.source;
        if (b.tagged) {
          if (!window._taggedCards) window._taggedCards = new Set();
          window._taggedCards.add(b.blockId);
          var btn = document.getElementById('tagBtn-' + b.blockId);
          if (btn) { btn.style.background='rgba(192,132,252,0.18)'; btn.style.color='#c084fc'; btn.style.borderColor='#c084fc'; }
        }
      }
    });
    console.log('[PulledBlock] ' + data.blocks.length + ' bloc(s) restauré(s)');
  } catch(e) {
    console.warn('[PulledBlock] load error', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

