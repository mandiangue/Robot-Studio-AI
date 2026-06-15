// ============================================================================
// cards.js — rendu du chat + cartes de cas de test (TC_STORE, renderTestCasesCard,
//            tc*, blocks, merge). Extrait de qa-agent.js.
// ============================================================================

// ── Welcome message ────────────────────────────────────────────────────────────
function showWelcome() {
  // Ne pas recréer si le welcome est déjà dans le DOM (injecté dans index.html)
  if (document.getElementById('welcomeMsg')) return;
  renderAgentMsg(`👋 Bonjour ! Je suis ton **QA Agent** spécialisé Robot Framework.

**Ce que je peux faire :**
- 🔵 Me connecter à **Azure DevOps** → récupérer une US → générer les tests RF
- 🟦 Me connecter à **Jira** → récupérer une US → générer les tests RF
- 🌐 Me connecter à **n'importe quelle app web** → générer des tests depuis l'URL
- 🤖 Générer des tests en **Keyword-Driven**, **BDD (Given/When/Then)** ou **Data-Driven**
- 📁 Créer une architecture **multi-fichiers** (variables.robot, keywords.robot, tests.robot)

**Comment ça marche en 2 étapes :**
1️⃣ Tu décris ce que tu veux tester → je propose des **cas de tests** en langage naturel (modifiables)
2️⃣ Tu valides → tu copies les cas → tu tapes **"génère le code RF"** → j'écris le fichier .robot

**Exemples de commandes :**
> *"Connecte-toi sur https://the-internet.herokuapp.com/login avec username: tomsmith et password: SuperSecretPassword! et génère 3 cas de tests"*

> *"Connecte-toi sur Azure https://dev.azure.com/monorg/projet avec le token XYZ, cherche l'US #42 et génère les tests RF en BDD"*

> *"Connecte-toi sur Jira https://monorg.atlassian.net avec email@company.com et token XYZ, cherche l'US PROJ-42"*

> *"Génère le code RF"* ← après avoir validé les cas de tests

**Configuration :** Colle ta clé API Anthropic en haut à droite, choisis la librairie et le style dans la sidebar. 🚀

💡 *L'IA ne remplace pas le QA — elle supprime la partie rébarbative pour que tu te concentres sur ce qui compte.*`, false);
}

// ── Render messages ────────────────────────────────────────────────────────────
function renderUserMsg(text, save = true) {
  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div class="msg-body">
      <div class="msg-bubble">${escHtml(text)}<button class="msg-copy-btn" onclick="copyMsg(this)" title="Copier" style="margin-left:8px;background:none;border:none;cursor:pointer;opacity:0.4;color:inherit;vertical-align:middle;padding:2px;line-height:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div>
    </div>`;
  document.getElementById('messages').appendChild(div);
  if (save) { chatHistory.push({ role: 'user', content: text }); LS.save(); }
  scrollToBottom();
}

function renderAgentMsg(markdown, save = true) {
  const div = document.createElement('div');
  div.className = 'msg agent';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-body">
      <div class="msg-bubble">${renderMarkdown(markdown)}<button class="msg-copy-btn" onclick="copyMsg(this)" title="Copier" style="margin-left:8px;background:none;border:none;cursor:pointer;opacity:0.4;color:inherit;vertical-align:middle;padding:2px;line-height:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div>
    </div>`;
  document.getElementById('messages').appendChild(div);
  if (save) { chatHistory.push({ role: 'assistant', content: markdown }); LS.save(); }
  scrollToBottom();
  return div;
}


function copyMsg(btn) {
  const bubble = btn.closest('.msg-bubble');
  if (!bubble) return;
  const clone = bubble.cloneNode(true);
  clone.querySelectorAll('.msg-copy-btn').forEach(b => b.remove());
  const txt = (clone.innerText || clone.textContent || '').trim();
  navigator.clipboard.writeText(txt).then(() => {
    const old = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    btn.style.opacity = '0.9';
    setTimeout(() => { btn.innerHTML = old; btn.style.opacity = '0.4'; }, 1200);
  }).catch(() => showToast('⚠️ Copie impossible'));
}
let _voiceRec = null;
function toggleVoiceInput() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('micBtn');
  const input = document.getElementById('userInput');
  if (!SR) { showToast('⚠️ Dictée vocale non supportée — utilise Chrome'); return; }
  if (_voiceRec) { _voiceRec.stop(); return; }
  const rec = new SR();
  rec.lang = 'fr-FR';
  rec.interimResults = true;
  rec.continuous = true;
  const base = input.value ? input.value.trim() + ' ' : '';
  rec.onstart = () => { _voiceRec = rec; if (micBtn) micBtn.style.color = '#ef4444'; showToast('🎤 Écoute… (re-clic pour arrêter)'); };
  rec.onresult = (e) => {
    let txt = '';
    for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
    input.value = base + txt;
    if (typeof autoResize === 'function') autoResize(input);
  };
  rec.onerror = (e) => { showToast('⚠️ Micro: ' + (e.error || 'erreur')); };
  rec.onend = () => { _voiceRec = null; if (micBtn) micBtn.style.color = '#cbd5e1'; };
  try { rec.start(); } catch(e) {}
}
// Azure DevOps work item type → icône + couleur
function azureTypeTag(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('bug'))                                   return `<span style="background:rgba(230,57,70,0.15);color:#DC2626;border:1px solid rgba(230,57,70,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">🐛 Bug</span>`;
  if (t.includes('epic'))                                  return `<span style="background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">⚡ Epic</span>`;
  if (t.includes('user story') || t.includes('story'))    return `<span style="background:rgba(0,212,170,0.15);color:var(--teal);border:1px solid rgba(0,212,170,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">📖 User Story</span>`;
  if (t.includes('task') || t.includes('tâche'))          return `<span style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">✅ Task</span>`;
  if (t.includes('feature'))                              return `<span style="background:rgba(245,158,11,0.15);color:var(--warn);border:1px solid rgba(245,158,11,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">🌟 Feature</span>`;
  if (t.includes('test case') || t.includes('test'))      return `<span style="background:rgba(0,212,170,0.1);color:var(--teal);border:1px solid rgba(0,212,170,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">🧪 Test</span>`;
  return `<span class="tag azure">${escHtml(type || '—')}</span>`;
}

function renderUsCard(us) {
  const html = `
    <div class="us-card">
      <div class="us-id">📋 Work Item #${us.id} · ${azureTypeTag(us.type)} · <span class="tag warn">${us.state}</span></div>
      <div class="us-title">${escHtml(us.title)}</div>
      ${us.description ? `<div class="us-section"><div class="us-section-label">DESCRIPTION</div><div class="us-section-content">${escHtml(stripHtml(us.description))}</div></div>` : ''}
      ${us.acceptance  ? `<div class="us-section"><div class="us-section-label">CRITÈRES D'ACCEPTANCE</div><div class="us-section-content us-acceptance">${escHtml(stripHtml(us.acceptance))}</div></div>` : ''}
      ${us.tags ? `<div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;margin-top:8px">Tags : ${escHtml(us.tags)}</div>` : ''}
    </div>`;
  return html;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg agent';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-body">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
  document.getElementById('messages').appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}
// ── Render test cases card — editable + actions ───────────────────────────────
const TC_STORE = {}; // cardId → { cases, url }
function renderTestCasesCard(cases, url, save = true, blockId) {
  // Use blockId if provided (restoration) to keep same cardId
  const cardId = blockId || ('tc-' + Date.now());
  // If restoring and TC_STORE already has this cardId (from localStorage), keep existing data
  if (!TC_STORE[cardId]) {
    TC_STORE[cardId] = { cases: cases.map(c => ({...c})), url };
    setTimeout(updateStatsBar, 100);
  } else {
    // Restore: update url if needed but keep pages/cases from TC_STORE
    TC_STORE[cardId].url = url || TC_STORE[cardId].url;
  }

  const div = document.createElement('div');
  div.className = 'msg agent';
  div.id = cardId;
  document.getElementById('messages').appendChild(div);

  rebuildCard(cardId);

  if (save) {
    chatHistory.push({ role: 'assistant', content: '[Test cases: ' + cases.map(c => c.name).join(', ') + ']' });
    LS.save();
    saveTCStore();
  }
  scrollToBottom();
}

function rebuildCard(cardId) {
  const store = TC_STORE[cardId];
  if (!store) return;
  const { cases, url } = store;
  // Ensure pages array exists
  if (!store.pages) store.pages = [{ label: url ? (() => { try { return new URL(url).hostname; } catch(e) { return 'Page principale'; } })() : 'Page principale', cases }];
  const el = document.getElementById(cardId);
  if (!el) return;

  const hostname = url ? (() => { try { return new URL(url).hostname; } catch(e) { return url; } })() : null;

  // Build cases HTML safely using template with escaped values
  let casesHtml = cases.map((c, idx) => {
    const safeId    = escHtml(String(c.id));
    const safeName  = escHtml(c.name || '');
    const safeDesc  = escHtml(c.description || '');
    const safeExp   = escHtml(c.expected || '');
    return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:12px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="background:rgba(0,212,170,0.15);color:var(--teal);font-family:'IBM Plex Mono',monospace;font-size:11px;padding:3px 10px;border-radius:4px;border:1px solid rgba(0,212,170,0.3);white-space:nowrap;font-weight:700">TC-${safeId}</span>
        <input data-card="${cardId}" data-idx="${idx}" data-field="name" value="${safeName}" placeholder="Nom du cas"
          style="flex:1;background:transparent;border:none;color:var(--text);font-weight:700;font-size:16px;font-family:'Syne',sans-serif;outline:none;min-width:0" />
        <button data-card="${cardId}" data-idx="${idx}" data-action="delete" title="Supprimer"
          style="background:rgba(230,57,70,0.12);border:1px solid rgba(230,57,70,0.3);color:#DC2626;width:30px;height:30px;border-radius:5px;font-size:14px;cursor:pointer;flex-shrink:0" title="Supprimer">✕</button>
      </div>
      <div style="padding:12px 16px 8px">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:6px">DESCRIPTION</div>
        <textarea data-card="${cardId}" data-idx="${idx}" data-field="description" placeholder="Description du cas..."
          rows="2" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--muted);color:#8ab4c4;font-size:14px;font-family:'Syne',sans-serif;outline:none;padding:2px 0 8px;resize:none;overflow:hidden;line-height:1.6">${safeDesc}</textarea>
      </div>
      <div style="padding:4px 16px 14px">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:6px">RÉSULTAT ATTENDU</div>
        <textarea data-card="${cardId}" data-idx="${idx}" data-field="expected" placeholder="Résultat attendu..."
          rows="2" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--muted);color:var(--teal);font-size:14px;font-family:'IBM Plex Mono',monospace;outline:none;padding:2px 0 8px;resize:none;overflow:hidden;line-height:1.6">${safeExp}</textarea>
      </div>
    </div>`;
  }).join('');

  // ── New multi-page innerHTML ──────────────────────────────────────────────
  // Ensure TC_STORE has pages
  if (!TC_STORE[cardId].pages) {
    // Use blockLabel from TC_STORE if available, else hostname, else default
    const initLabel = TC_STORE[cardId].pageLabel || hostname || 'Page principale';
    TC_STORE[cardId].pages = [{ label: initLabel, cases: [...cases] }];
  } else {
    // Pages already restored from localStorage — don't overwrite
  }
  const storeRef = TC_STORE[cardId];

  function buildPageCase(c, pi, idx) {
    // Always use stored testId — never auto-generate unless missing
    if (!c.testId) c.testId = 'TC_' + String(idx+1).padStart(3,'0');
    const tid   = escHtml(c.testId);
    const nm    = escHtml(c.name || '');
    const desc  = escHtml(c.description || '');
    const exp   = escHtml(c.expected || '');
    return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="background:rgba(0,212,170,0.15);color:var(--teal);font-family:'IBM Plex Mono',monospace;font-size:10px;padding:2px 8px;border-radius:4px;border:1px solid rgba(0,212,170,0.3);white-space:nowrap;font-weight:700">${tid}</span>
        <input data-card="${cardId}" data-pi="${pi}" data-ci="${idx}" data-field="name" value="${nm}" placeholder="Nom du cas"
          style="flex:1;background:transparent;border:none;color:var(--text);font-weight:700;font-size:14px;font-family:'Syne',sans-serif;outline:none;min-width:0" />
        <button data-card="${cardId}" data-pi="${pi}" data-ci="${idx}" data-action="del-case"
          style="background:rgba(230,57,70,0.12);border:1px solid rgba(230,57,70,0.3);color:#DC2626;width:26px;height:26px;border-radius:4px;font-size:13px;cursor:pointer;flex-shrink:0" title="Supprimer">✕</button>
      </div>
      <div style="padding:8px 12px 4px">
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:4px">DESCRIPTION</div>
        <textarea data-card="${cardId}" data-pi="${pi}" data-ci="${idx}" data-field="description" rows="2"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--muted);color:#8ab4c4;font-size:13px;font-family:'Syne',sans-serif;outline:none;padding:2px 0 6px;resize:vertical;min-height:36px;line-height:1.6">${desc}</textarea>
      </div>
      <div style="padding:4px 12px 10px">
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:4px">RÉSULTAT ATTENDU</div>
        <textarea data-card="${cardId}" data-pi="${pi}" data-ci="${idx}" data-field="expected" rows="1"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--muted);color:var(--teal);font-size:13px;font-family:'IBM Plex Mono',monospace;outline:none;padding:2px 0 6px;resize:vertical;min-height:28px;line-height:1.6">${exp}</textarea>
      </div>
    </div>`;
  }

  const pagesHtml = storeRef.pages.map((pg, pi) => {
    const pgLabel = escHtml(pg.label || ('Page ' + (pi+1)));
    const pgCases = (pg.cases||[]).map((c, ci) => buildPageCase(c, pi, ci)).join('');
    const canDel  = storeRef.pages.length > 1;
    return `<div style="margin-bottom:14px;border:1px solid rgba(0,212,170,0.18);border-radius:10px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:8px;padding:9px 14px;background:rgba(0,212,170,0.05);border-bottom:1px solid rgba(0,212,170,0.15)">
        <span style="font-size:10px;color:var(--teal);font-family:'IBM Plex Mono',monospace;font-weight:700;flex-shrink:0">📄 PAGE ${pi+1}</span>
        <input data-card="${cardId}" data-pi="${pi}" data-field="pagelabel" value="${pgLabel}" placeholder="Nom de la page..."
          style="flex:1;background:transparent;border:none;border-bottom:1px solid transparent;color:var(--text);font-size:13px;font-weight:600;font-family:'Syne',sans-serif;outline:none;padding:2px 4px"
          onfocus="this.style.borderBottomColor='var(--teal)'" onblur="this.style.borderBottomColor='transparent'" />
        <span style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace">${pg.cases.length} cas</span>
        ${canDel ? `<button data-card="${cardId}" data-pi="${pi}" data-action="del-page"
          style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:11px;padding:2px 5px"
          onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray)'" title="Supprimer cette page">✕</button>` : ''}
      </div>
      <div style="padding:10px 12px">
        ${pgCases}
        <button data-card="${cardId}" data-pi="${pi}" data-action="add-case"
          style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);color:#60a5fa;padding:5px 12px;border-radius:6px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          + Ajouter un cas
        </button>
      </div>
    </div>`;
  }).join('');

  const totalCases = storeRef.pages.reduce((s, p) => s + (p.cases||[]).length, 0);

  el.innerHTML = `
    <div class="msg-avatar" style="margin-top:4px">🤖</div>
    <div class="msg-body" style="width:100%;max-width:100%">
      <div class="msg-bubble" style="padding:16px 20px;resize:horizontal;overflow:auto;min-width:340px;max-width:100%;box-sizing:border-box">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
          <strong style="font-size:15px">📋 ${totalCases} cas — ${storeRef.pages.length} page${storeRef.pages.length>1?'s':''} POM${hostname?` <span class="tag rf">🌐 ${hostname}</span>`:''}</strong>
        </div>
        <div id="tc-pages-${cardId}">${pagesHtml}</div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;padding-top:12px;border-top:1px solid var(--border)">
          <button data-card="${cardId}" data-action="add-page"
            style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:8px 14px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Ajouter une nouvelle page POM">+ Ajouter une page</button>
          <button data-card="${cardId}" data-action="select-blocks"
            style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);color:#60a5fa;padding:8px 14px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Sélectionner des blocs à fusionner" title="Sélectionner des blocs à fusionner">☑ Sélectionner</button>

          <button data-card="${cardId}" data-action="downloadcsv"
            style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);color:#22c55e;padding:8px 12px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Télécharger les cas de tests en CSV Excel">⬇️ CSV</button>
          <button data-card="${cardId}" data-action="copy"
            style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);padding:8px 14px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Copier tous les cas de tests">📋 Copier</button>
          <button data-card="${cardId}" data-action="generate"
            style="background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;padding:8px 18px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer;font-weight:700" title="Générer le code Robot Framework">⚡ Générer le code RF</button>
          <button data-card="${cardId}" data-action="cancel"
            style="background:rgba(230,57,70,0.08);border:1px solid var(--red);color:var(--red);padding:8px 12px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Supprimer ce bloc de cas de tests">✕</button>
        </div>
      </div>
    </div>`;

  // Event delegation
  el.addEventListener('input', e => {
    const t = e.target;
    if (!t.dataset.card) return;
    const pi = t.dataset.pi !== undefined ? parseInt(t.dataset.pi) : -1;
    const ci = t.dataset.ci !== undefined ? parseInt(t.dataset.ci) : -1;
    if (t.dataset.field === 'pagelabel' && pi >= 0 && storeRef.pages[pi]) {
      storeRef.pages[pi].label = t.value;
    } else if (pi >= 0 && ci >= 0 && storeRef.pages[pi]?.cases[ci]) {
      storeRef.pages[pi].cases[ci][t.dataset.field] = t.value;
    } else if (t.dataset.idx !== undefined) {
      tcUpdate(t.dataset.card, parseInt(t.dataset.idx), t.dataset.field, t.value);
    }
    syncStoreToPending(t.dataset.card);
  }, { once: false });

  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const cid    = btn.dataset.card;
    const action = btn.dataset.action;
    const pi     = btn.dataset.pi !== undefined ? parseInt(btn.dataset.pi) : -1;
    const ci     = btn.dataset.ci !== undefined ? parseInt(btn.dataset.ci) : -1;
    const stC = TC_STORE[cid];
    // Allow select-blocks and merge-all even without TC_STORE entry
    if (!stC && action !== 'select-blocks' && action !== 'merge-all') return;
    const st = stC;

    if (action === 'del-case' && pi >= 0 && ci >= 0) {
      st.pages[pi].cases.splice(ci, 1);
      syncStoreToPending(cid); rebuildCard(cid);
    } else if (action === 'del-page' && pi >= 0) {
      st.pages.splice(pi, 1);
      syncStoreToPending(cid); rebuildCard(cid);
    } else if (action === 'add-case' && pi >= 0) {
      const n = st.pages[pi].cases.length + 1;
      st.pages[pi].cases.push({ id: n, testId: 'TC_' + String(n).padStart(3,'0'), name: 'Nouveau cas', description: '', expected: '' });
      syncStoreToPending(cid); rebuildCard(cid);
    } else if (action === 'add-page') {
      st.pages.push({ label: 'Page ' + (st.pages.length + 1), cases: [{ id: 1, testId: 'TC_001', name: 'Nouveau cas', description: '', expected: '' }] });
      syncStoreToPending(cid); rebuildCard(cid);
    } else if (action === 'copy')           tcCopy(cid);
    else if (action === 'generate')         generateCodeFromCard(cid, window._serverApiKey || document.getElementById('apiKey').value.trim());
    else if (action === 'downloadcsv')      downloadCasesCSV(cid);
    else if (action === 'select-blocks')    { openBlockSelector(cid); return; }
    else if (action === 'merge-all')        { mergeAllCards(cid); return; }
    else if (action === 'cancel')           tcCancelAll(cid);
    else if (action === 'delete')           tcDelete(cid, parseInt(btn.dataset.idx));
    else if (action === 'add')              tcAdd(cid);
  });
}


// TC actions

function downloadCasesCSV(cardId) {
  const cases = pendingTestCases?.cases || TC_STORE[cardId]?.cases;
  if (!cases) return;

  const headers = ['Test_ID', 'Nom', 'Description', 'Résultat attendu'];
  const rows    = cases.map(c => [
    c.testId || ('TC_' + String(c.id).padStart(3,'0')),
    c.name        || '',
    c.description || '',
    c.expected    || '',
  ].map(v => '"' + String(v).replace(/"/g, '""') + '"'));

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const bom = '\uFEFF'; // UTF-8 BOM for Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cas_de_tests_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('⬇️ CSV téléchargé — ouvrable dans Excel');
}




// ── Block selector modal ──────────────────────────────────────────────────────
function openBlockSelector(targetCardId) {
  console.log('[BlockSelector] targetCardId:', targetCardId);
  console.log('[BlockSelector] TC_STORE keys:', Object.keys(TC_STORE));
  const otherCards = Object.keys(TC_STORE).filter(id => id !== targetCardId);
  console.log('[BlockSelector] otherCards:', otherCards);
  if (otherCards.length === 0) {
    showToast('⚠️ Aucun autre bloc disponible dans le chat');
    return;
  }

  document.getElementById('blockSelectorModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'blockSelectorModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px';

  const rows = otherCards.map(cardId => {
    const store = TC_STORE[cardId];
    if (!store) return '';
    const pages = store.pages || [{ label: store.pageLabel || 'Page', cases: store.cases || [] }];
    const totalCases = pages.reduce((s,p) => s + (p.cases||[]).length, 0);
    const pageLabels = pages.map(p => p.label).join(', ');
    return `<label style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--card);
              border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;transition:border-color .15s"
              onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
      <input type="checkbox" value="${cardId}" class="block-select-cb"
        style="accent-color:var(--teal);width:16px;height:16px;flex-shrink:0;margin-top:2px;cursor:pointer" />
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px">${escHtml(pageLabels)}</div>
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace">
          ${pages.length} page${pages.length>1?'s':''} · ${totalCases} cas de tests
        </div>
      </div>
    </label>`;
  }).join('');

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:520px;overflow:hidden;display:flex;flex-direction:column">
      <!-- Header -->
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">☑ Sélectionner des blocs à fusionner</span>
        <button onclick="document.getElementById('blockSelectorModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer" title="Fermer">✕</button>
      </div>
      <!-- Bloc list -->
      <div style="padding:16px 20px;max-height:360px;overflow-y:auto">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:12px">
          BLOCS DISPONIBLES — coche ceux à fusionner dans le bloc actuel
        </div>
        ${rows}
      </div>
      <!-- Footer -->
      <div style="display:flex;gap:10px;padding:14px 20px;border-top:1px solid var(--border);background:var(--card)">
        <button onclick="mergeSelectedBlocks('${targetCardId}')"
          style="flex:1;background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;
                 padding:10px 20px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          🔀 Fusionner la sélection
        </button>
        <button onclick="document.getElementById('blockSelectorModal').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:10px 16px;
                 border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          Annuler
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);
}

function mergeSelectedBlocks(targetCardId) {
  const targetStore = TC_STORE[targetCardId];
  if (!targetStore) return;

  // Ensure target has pages
  if (!targetStore.pages) {
    targetStore.pages = [{ label: targetStore.pageLabel || 'Page principale', cases: [...(targetStore.cases||[])] }];
  }

  const checked = [...document.querySelectorAll('.block-select-cb:checked')];
  if (checked.length === 0) { showToast('⚠️ Coche au moins un bloc'); return; }

  let merged = 0;
  checked.forEach(cb => {
    const srcId    = cb.value;
    const srcStore = TC_STORE[srcId];
    if (!srcStore) return;

    if (!srcStore.pages) {
      srcStore.pages = [{ label: srcStore.pageLabel || 'Page importée', cases: [...(srcStore.cases||[])] }];
    }

    srcStore.pages.forEach(page => {
      if (!page.cases || page.cases.length === 0) return;
      const pageLabel = page.label && page.label !== 'Page principale' ? page.label : (srcStore.pageLabel || 'Page importée');

      // Check if a page with same label already exists in target
      const existingPage = targetStore.pages.find(p =>
        p.label.toLowerCase().trim() === pageLabel.toLowerCase().trim()
      );

      // Deduplicate cases by name
      const existingNames = new Set(
        (existingPage ? existingPage.cases : targetStore.pages.flatMap(p => p.cases||[]))
          .map(c => (c.name||'').toLowerCase().trim())
      );

      // For different apps (different URL/pageLabel), allow same name
      // For same app, deduplicate by name
      const srcAppLabel = srcStore.pageLabel || '';
      const tgtAppLabel = targetStore.pageLabel || '';
      const sameApp = srcAppLabel && tgtAppLabel &&
        srcAppLabel.toLowerCase().replace(/[^a-z0-9]/g,'') ===
        tgtAppLabel.toLowerCase().replace(/[^a-z0-9]/g,'');

      const newCases = sameApp
        ? page.cases.filter(c => !existingNames.has((c.name||'').toLowerCase().trim()))
        : page.cases; // different apps — keep all cases even if same name

      if (newCases.length === 0) return; // all duplicates, skip

      if (existingPage) {
        // Merge into existing page
        existingPage.cases.push(...newCases);
      } else {
        // New page
        targetStore.pages.push({ label: pageLabel, cases: newCases });
      }
      merged++;
    });

    // Remove source TC card and any result card immediately after it
    const srcEl = document.getElementById(srcId);
    if (srcEl) {
      // Remove next sibling result cards (code cards generated from this TC block)
      let next = srcEl.nextElementSibling;
      while (next && next.classList.contains('msg') && next.querySelector('.msg-bubble[style*="padding:0"]')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
      srcEl.remove();
    }
    delete TC_STORE[srcId];
  });

  if (merged === 0) { showToast('⚠️ Aucune page à fusionner'); return; }

  // Renumber testIds sequentially — names stay untouched
  let seqIdx = 1;
  targetStore.pages.forEach(p => {
    (p.cases||[]).forEach(c => {
      c.testId = 'TC_' + String(seqIdx).padStart(3,'0');
      // c.name is NEVER modified
      seqIdx++;
    });
  });

  // Clear saved code cards — will be regenerated
  // Ne supprimer que les cartes de code (multi) — garder les rapports et suite-reports
  window._codeCards = (window._codeCards||[]).filter(c => c.type === 'report' || c.type === 'suite-report');

  document.getElementById('blockSelectorModal')?.remove();
  syncStoreToPending(targetCardId);
  rebuildCard(targetCardId);
  const inp = document.getElementById('userInput');
  if (inp) { inp.value = ''; inp.style.height = 'auto'; }
  showToast('🔀 ' + merged + ' page(s) fusionnée(s) — génération RF...');
  setTimeout(() => { const k=window._serverApiKey||document.getElementById('apiKey')?.value?.trim(); if(k) generateCodeFromCases(k); else showToast('⚠️ Clé API requise'); }, 300);
}

// ── Merge all TC cards in the chat into one ───────────────────────────────────
function mergeAllCards(targetCardId) {
  const targetStore = TC_STORE[targetCardId];
  if (!targetStore) return;

  // Ensure target has pages
  if (!targetStore.pages) {
    targetStore.pages = [{ label: targetStore.pageLabel || 'Page principale', cases: [...(targetStore.cases||[])] }];
  }

  let merged = 0;

  Object.keys(TC_STORE).forEach(cardId => {
    if (cardId === targetCardId) return;
    const srcStore = TC_STORE[cardId];
    if (!srcStore) return;

    // Ensure source has pages
    if (!srcStore.pages) {
      srcStore.pages = [{ label: srcStore.pageLabel || 'Page importée', cases: [...(srcStore.cases||[])] }];
    }
    const srcPages = srcStore.pages;

    srcPages.forEach(page => {
      if (page.cases && page.cases.length > 0) {
        // Add as new page in target
        targetStore.pages.push({
          label: page.label && page.label !== 'Page principale' ? page.label : (srcStore.pageLabel || 'Page importée'),
          cases: page.cases.map((c, i) => ({
            ...c,
            testId: c.testId || ('TC_' + String(i+1).padStart(3,'0')),
          })),
        });
        merged++;
      }
    });

    // Remove source TC card AND its associated result cards
    const srcEl = document.getElementById(cardId);
    if (srcEl) {
      let next = srcEl.nextElementSibling;
      while (next && next.classList.contains('msg') && next.querySelector('.msg-bubble[style*="padding:0"]')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
      srcEl.remove();
    }
    delete TC_STORE[cardId];
  });

  if (merged === 0) {
    showToast('⚠️ Aucun autre bloc à fusionner');
    return;
  }

  // Renumber all testIds across all pages
  let globalIdx = 1;
  targetStore.pages.forEach(page => {
    page.cases.forEach(c => {
      c.testId = 'TC_' + String(globalIdx).padStart(3, '0');
      globalIdx++;
    });
  });

  syncStoreToPending(targetCardId);
  rebuildCard(targetCardId);
  showToast('🔀 ' + merged + ' page(s) fusionnée(s) dans ce bloc');
}

function syncStoreToPending(cardId) {
  const store = TC_STORE[cardId];
  if (!store) return;
  const allCases = store.pages ? store.pages.flatMap(p => p.cases) : store.cases;
  if (pendingTestCases) { pendingTestCases.cases = allCases; pendingTestCases.pages = store.pages; }
  store.cases = allCases;
  saveSuiteRegistry && saveSuiteRegistry();
  LS.save();
  saveTCStore();
}


function tcUpdate(cardId, idx, field, value) {
  const oldValue = TC_STORE[cardId]?.cases?.[idx]?.[field];
  if (TC_STORE[cardId]) TC_STORE[cardId].cases[idx][field] = value;
  if (pendingTestCases) pendingTestCases.cases[idx][field] = value;
  // Si le locator change, mettre à jour le code RF dans _codeCards
  if (field === 'locator' && oldValue && value && oldValue !== value) {
    const card = (window._codeCards||[]).find(c => c.cardId === cardId);
    if (card?.files) {
      card.files.forEach(f => {
        if (f.code) {
          f.code = f.code.split(oldValue).join(value);
        }
      });
      saveCodeCards();
    }
    // Mettre à jour aussi dans suiteRegistry
    const regEntry = suiteRegistry.find(t => t.cardId === cardId);
    if (regEntry?.code) {
      regEntry.code = regEntry.code.split(oldValue).join(value);
      saveSuiteRegistry();
    }
  }
  saveTCStore();
  LS.save();
}

function tcDelete(cardId, idx) {
  if (!TC_STORE[cardId]) return;
  TC_STORE[cardId].cases.splice(idx, 1);
  TC_STORE[cardId].cases.forEach((c, i) => c.id = i + 1);
  if (pendingTestCases) { pendingTestCases.cases = [...TC_STORE[cardId].cases]; LS.save(); }
  rebuildCard(cardId);
}

function tcAdd(cardId) {
  if (!TC_STORE[cardId]) return;
  const cases = TC_STORE[cardId].cases;
  cases.push({ id: cases.length + 1, name: 'Nouveau cas', description: '', expected: '' });
  if (pendingTestCases) { pendingTestCases.cases = [...cases]; LS.save(); }
  rebuildCard(cardId);
}

function tcCopy(cardId) {
  const cases = TC_STORE[cardId]?.cases || pendingTestCases?.cases;
  if (!cases) return;
  const text = cases.map(c =>
    'TC-' + c.id + ' — ' + c.name + '\nDescription : ' + c.description + '\nRésultat attendu : ' + c.expected
  ).join('\n\n');
  navigator.clipboard.writeText(text).then(() => showToast('📋 Cas copiés !'));
}

function tcCancelAll(cardId) {
  const _tcStore = TC_STORE[cardId];
  const _tcLabel = _tcStore?.pageLabel || _tcStore?.pages?.[0]?.label || cardId;
  const _tcCount = _tcStore?.pages ? _tcStore.pages.reduce((s,p) => s+(p.cases||[]).length, 0) : (_tcStore?.cases?.length || 0);
  showConfirmDialog('🗑 Supprimer le bloc', 'Supprimer le bloc <b>' + escHtml(_tcLabel) + '</b> (' + _tcCount + ' cas de tests) ?', () => {
    pendingTestCases = null;
    pendingBlocks = [];
    delete TC_STORE[cardId];
    try {
      localStorage.removeItem('qa_agent_pending');
      saveTCStore();
      LS.save();
    } catch(e) {}
    const el = document.getElementById(cardId);
    if (el) el.remove();
    showToast('🗑 Bloc supprimé');
  });
}




// ── Multi-block POM management ────────────────────────────────────────────────
function addNewBlock() {
  // Hide global actions on all previous cards
  updateGlobalActionBars();
  // Ask user to describe next page
  const input = document.getElementById('userInput');
  if (input) {
    input.value = '';
    input.placeholder = 'Décris les cas de tests pour la prochaine page...';
    input.focus();
  }
  showToast('💡 Décris la prochaine page pour ajouter un bloc');
}

function updateGlobalActionBars() {
  // Hide global actions on all cards except last
  const allGlobal = document.querySelectorAll('[id^="globalActions-"]');
  allGlobal.forEach((el, i) => {
    el.style.display = i === allGlobal.length - 1 ? 'flex' : 'none';
  });
}
