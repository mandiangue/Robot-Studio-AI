// ============================================================================
// report.js — rapports d'exécution (openTestReport, renderReportCard, éditeur,
//             historique, rapports consolidés). Extrait de qa-agent.js.
// ============================================================================

// Store current report data + history
let _reportData   = null;
let _reportHistory = []; // last 10 runs

function openTestReport(data, suiteCtx) {
  _reportData = JSON.parse(JSON.stringify(data));

  if (suiteCtx) {
    data.isSuite    = suiteCtx.isSuite;
    data.suiteName  = suiteCtx.suiteName;
    data.suiteTests = suiteCtx.tests;
  }

  // runNumber = timestamp unique pour éviter les collisions au reload
  data.runNumber = data.runNumber || Date.now();
  data.runDate   = data.runDate || new Date().toLocaleString('fr-FR');
  // runType comes from server results or _lastRunType
  if (!data.runType) data.runType = window._lastRunType || 'web';
  // Nom de la page/bloc testé
  if (!data.pageTitle) data.pageTitle = window._lastGeneratedTitle || '';
  // Save environment string for dashboard detection
  const envMap = {
    mobile:   'Robot Framework + AppiumLibrary (Mobile)',
    api:      'Robot Framework + RequestsLibrary (API REST)',
    database: 'Robot Framework + DatabaseLibrary (SQL)',
    web:      'Robot Framework + SeleniumLibrary (Web)',
  };
  data.environment = envMap[data.runType] || envMap.web;

  // Update the "en cours" message to show final status + Replay button
  // Update run label when run completes
  const msgId = window._currentRunMsgId;
  if (msgId) {
    const lbl = document.getElementById(msgId + '-label');
    if (lbl) {
      const icon = data.status === 'PASS' ? '✅' : '❌';
      const rate = data.total > 0 ? Math.round(data.passed / data.total * 100) : 0;
      lbl.textContent = icon + ' ' + data.status + ' — ' + data.passed + '/' + data.total + ' (' + rate + '%) en ' + fmtDuration(data.duration);
      lbl.style.color = data.status === 'PASS' ? 'var(--teal)' : 'var(--red)';
      lbl.style.fontWeight = '700';
    }
    localStorage.removeItem('qa_active_run');
    window._currentRunMsgId = null;
  }


  if (window._currentRunMsg) {
    const bubble = window._currentRunMsg.querySelector('.msg-bubble');
    if (bubble) {
      const icon  = data.status === 'PASS' ? '✅' : '❌';
      const color = data.status === 'PASS' ? 'var(--teal)' : 'var(--red)';
      const rate  = data.total > 0 ? Math.round(data.passed / data.total * 100) : 0;
      const dur   = fmtDuration(data.duration);
      bubble.innerHTML =
        '<span style="font-size:13px;color:' + color + ';font-weight:700">' +
        icon + ' ' + data.status + ' — ' + data.passed + '/' + data.total +
        ' tests réussis (' + rate + '%) en ' + dur + '</span>' +
        '<br><span style="font-size:11px;color:var(--gray)">Le rapport complet est disponible ci-dessous 👇</span>';
    }
    window._currentRunMsg = null;
  }

  // Keep last 10 runs en mémoire uniquement (pas en localStorage — doublon de qa_code_cards)
  _reportHistory.push(JSON.parse(JSON.stringify(data)));
  if (_reportHistory.length > 10) _reportHistory.shift();

  // qa_run_history supprimé — données dans qa_code_cards

  renderReportCard(data);
}

// Load history from qa_code_cards (qa_run_history supprimé — doublon)
try {
  const cards = JSON.parse(localStorage.getItem('qa_code_cards') || '[]');
  _reportHistory = cards
    .filter(c => c.type === 'report' && c.data)
    .map(c => c.data)
    .sort((a,b) => (a.runNumber||0) - (b.runNumber||0))
    .slice(-10);
} catch(e) {}

function renderReportCard(data, suiteCardId) {
  // Each run gets its own card — don't remove previous ones
  const _t = t; // alias traducteur (cohérence avec buildInlineReport)

  const reportHtml = buildInlineReport(data);
  const blob    = new Blob([reportHtml], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  const date    = new Date().toISOString().slice(0,10);

  const runNum = data.runNumber || Date.now();
  data.runNumber = runNum; // ensure runNumber is always set
  // cardId stable basé uniquement sur runNumber — même rapport = même cardId
  const cardId = 'reportCard-' + runNum;
  const isRerender = !!document.getElementById(cardId);

  // Registre des rapports vivants (re-render i18n). Révoque l'ancien blob pour éviter les fuites.
  window._openReports = window._openReports || {};
  const _prev = window._openReports[cardId];
  if (_prev && _prev.blobUrl) { try { URL.revokeObjectURL(_prev.blobUrl); } catch(e) {} }
  window._openReports[cardId] = { data, blobUrl, suiteCardId: suiteCardId || null };
  const div = document.createElement('div');
  div.className = 'msg agent';
  div.id = cardId;
  div.style.cssText = 'width:100%';

  div.innerHTML = `
    <div class="msg-avatar">📊</div>
    <div class="msg-body" style="width:100%;max-width:920px">
      <div class="msg-bubble" style="padding:0;overflow:hidden">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--card);border-bottom:1px solid var(--border);flex-wrap:wrap">
          <span style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.3);padding:3px 10px;border-radius:10px">
            RUN #${runNum}
          </span>
          ${data.isSuite ? `<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(245,158,11,0.15);color:var(--warn);border:1px solid rgba(245,158,11,0.3);padding:3px 10px;border-radius:10px">
            ${_t('report.suiteBadge')} ${escHtml(data.suiteName||'')}
          </span>${(() => {
            const names = data.blockNames||[];
            const max = 3;
            const visible = names.slice(0, max);
            const rest = names.slice(max);
            const badges = visible.map(n => `<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(0,212,170,0.12);color:var(--teal);border:1px solid rgba(0,212,170,0.3);padding:3px 10px;border-radius:10px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis" title="${escHtml(n)}">${escHtml(n)}</span>`).join('');
            const more = rest.length ? `<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(168,85,247,0.12);color:#c084fc;border:1px solid rgba(168,85,247,0.3);padding:3px 10px;border-radius:10px;white-space:nowrap;cursor:default" title="${escHtml(rest.join(', '))}">+${rest.length} ${_t('report.moreOthers')}</span>` : '';
            return badges + more;
          })()}` : (data.pageTitle ? `<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(0,212,170,0.12);color:var(--teal);border:1px solid rgba(0,212,170,0.3);padding:3px 10px;border-radius:10px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(data.pageTitle)}">
            📄 ${escHtml(data.pageTitle)}
          </span>` : '')}
          ${(()=>{
            const badges = { mobile:'📱 Run Mobile', api:'🔌 Run API', database:'🗄️ Run Database', web:'🔵 Run Web' };
            const colors = { mobile:'rgba(168,85,247,0.15)', api:'rgba(59,130,246,0.15)', database:'rgba(34,197,94,0.15)', web:'rgba(0,212,170,0.1)' };
            const textc  = { mobile:'#c084fc', api:'#60a5fa', database:'#22c55e', web:'var(--teal)' };
            const t = data.runType || 'web';
            return `<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:${colors[t]};color:${textc[t]};border:1px solid ${textc[t]};padding:3px 10px;border-radius:10px">${badges[t]||'🔵 Run Web'}</span>`;
          })()}
          <span style="font-size:13px;font-family:'IBM Plex Mono',monospace;color:${data.status==='PASS'?'var(--teal)':'var(--red)'};font-weight:700">
            ${data.status==='PASS'?'✅':'❌'} ${data.passed}/${data.total} ${_t('report.passedShort')}
          </span>
          ${data.failed > 0 ? `<button onclick="scrollToFailed('${cardId}')"
            style="background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.3);color:#DC2626;padding:4px 12px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
            ❌ ${data.failed} ${_t('report.failureWord')}${data.failed>1?'s':''}
          </button>` : ''}
          <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center">

            <button onclick="openRunHistory()"
              style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:4px 12px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
              ${_t('report.history')} (${_reportHistory.length})
            </button>
            <a href="${blobUrl}" download="rapport_tests_${date}.html"
              style="background:rgba(245,158,11,0.08);border:1px solid var(--warn);color:var(--warn);padding:4px 12px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;text-decoration:none">
              ${_t('report.download')}
            </a>
            <button onclick="deleteReportCard('${cardId}', ${runNum})"
              style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);color:var(--red);
                     padding:4px 10px;border-radius:5px;font-size:13px;cursor:pointer"
              title="${_t('report.deleteTitle')}">✕</button>
          </div>
        </div>

        <!-- Iframe report -->
        <iframe src="${blobUrl}" style="width:100%;height:580px;border:none;display:block"></iframe>
      </div>
    </div>`;

  if (isRerender) {
    // Re-render (ex. bascule de langue) : remplace la carte en place, pas de scroll/persist
    document.getElementById(cardId).replaceWith(div);
    updateStatsBar();
    return;
  }
  document.getElementById('messages').appendChild(div);
  scrollToBottom();

  // ── Persist report card ───────────────────────────────────────────────────
  window._codeCards = window._codeCards || [];
  // Ensure runType is always set before saving
  if (!data.runType) {
    // Try to detect from last run code
    const lastCode = window._lastGeneratedCode || '';
    const lastRunType = window._lastRunType;
    data.runType = lastRunType || (lastCode.includes('AppiumLibrary') ? 'mobile'
      : lastCode.includes('RequestsLibrary') ? 'api'
      : lastCode.includes('DatabaseLibrary') ? 'database' : 'web');
  }
  // Déduplique par runNumber — un seul rapport par run
  window._codeCards = (window._codeCards||[]).filter(c =>
    !(c.type === 'report' && (c.cardId === cardId || c.data?.runNumber === runNum))
  );
  const reportEntry = { type: 'report', cardId, suiteCardId: suiteCardId||null, data: JSON.parse(JSON.stringify(data)) };
  window._codeCards.push(reportEntry);
  // Si c'est un rapport de suite, ne pas sauvegarder maintenant —
  // renderConsolidatedSuiteReport_inline appellera saveCodeCards() après avoir pushé le suite-report
  if (!suiteCardId) {
    saveCodeCards(); // persiste dans MongoDB + localStorage
  }
  updateStatsBar();
}

// ── Re-render des rapports ouverts à la bascule de langue (registre core.js) ────
window.__i18nRerender = window.__i18nRerender || [];
window.__i18nRerender.push(() => {
  const reps = window._openReports || {};
  Object.keys(reps).forEach(cardId => {
    if (document.getElementById(cardId)) renderReportCard(reps[cardId].data, reps[cardId].suiteCardId);
  });
});

// ── Report editor modal ────────────────────────────────────────────────────────
function openReportEditor() {
  if (!_reportData) return;
  document.getElementById('reportEditorModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'reportEditorModal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px`;

  const testsEditorHtml = _reportData.tests.map((t, i) => `
    <div style="background:var(--card);border:1px solid var(--border);border-left:4px solid ${t.status==='PASS'?'#22c55e':t.status==='FAIL'?'#DC2626':'#f59e0b'};border-radius:8px;padding:12px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
        <span style="font-size:14px">${t.status==='PASS'?'✅':'❌'}</span>
        <input data-test-idx="${i}" data-field="name" value="${escHtml(t.name)}"
          style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:5px;color:var(--text);padding:6px 10px;font-size:13px;font-family:'Syne',sans-serif;outline:none;min-width:0"
          oninput="updateReportField(${i},'name',this.value)" />
        <select data-test-idx="${i}" data-field="status"
          style="background:var(--surface);border:1px solid var(--border);border-radius:5px;color:var(--text);padding:6px 8px;font-size:12px;font-family:'IBM Plex Mono',monospace;outline:none"
          onchange="updateReportField(${i},'status',this.value)">
          <option value="PASS" ${t.status==='PASS'?'selected':''}>✅ PASS</option>
          <option value="FAIL" ${t.status==='FAIL'?'selected':''}>❌ FAIL</option>
          <option value="SKIP" ${t.status==='SKIP'?'selected':''}>⏭️ SKIP</option>
        </select>
      </div>
      ${t.status==='FAIL'?`
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:4px">COMMENTAIRE / ANALYSE</div>
        <textarea data-test-idx="${i}" data-field="failureAnalysis" rows="2"
          style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:5px;color:#fca5a5;padding:6px 10px;font-size:12px;font-family:'Syne',sans-serif;outline:none;resize:none"
          oninput="updateReportField(${i},'failureAnalysis',this.value)">${escHtml(t.failureAnalysis||'')}</textarea>
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin:6px 0 4px">SOLUTION SUGGÉRÉE</div>
        <textarea data-test-idx="${i}" data-field="suggestion" rows="2"
          style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:5px;color:#fcd34d;padding:6px 10px;font-size:12px;font-family:'Syne',sans-serif;outline:none;resize:none"
          oninput="updateReportField(${i},'suggestion',this.value)">${escHtml(t.suggestion||'')}</textarea>
      `:''}
    </div>`).join('');

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:700px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column">

      <!-- Modal header -->
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">✏️ Éditer le rapport</span>
        <button onclick="document.getElementById('reportEditorModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer;line-height:1" title="Fermer">✕</button>
      </div>

      <!-- Rapport title edit -->
      <div style="padding:16px 20px;border-bottom:1px solid var(--border)">
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:6px">TITRE DU RAPPORT</div>
        <input id="reportTitleInput" value="${escHtml(_reportData.reportTitle||'Rapport de Tests')}"
          style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px 14px;font-size:14px;font-family:'Syne',sans-serif;outline:none"
          oninput="_reportData.reportTitle=this.value" />
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin:12px 0 6px">COMMENTAIRE GLOBAL</div>
        <textarea id="reportCommentInput" rows="2"
          style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px 14px;font-size:13px;font-family:'Syne',sans-serif;outline:none;resize:none"
          oninput="_reportData.comment=this.value">${escHtml(_reportData.comment||'')}</textarea>
      </div>

      <!-- Tests scroll -->
      <div style="overflow-y:auto;padding:16px 20px;flex:1">
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:10px">CAS DE TESTS</div>
        ${testsEditorHtml}
      </div>

      <!-- Footer -->
      <div style="display:flex;gap:10px;padding:14px 20px;border-top:1px solid var(--border);background:var(--card)">
        <button onclick="applyReportEdits()"
          style="background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;padding:10px 24px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer;flex:1">
          ✅ Appliquer les modifications
        </button>
        <button onclick="document.getElementById('reportEditorModal').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:10px 18px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          Annuler
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);
}

function updateReportField(idx, field, value) {
  if (_reportData?.tests?.[idx]) {
    _reportData.tests[idx][field] = value;
    // Recalc stats
    _reportData.passed  = _reportData.tests.filter(t => t.status === 'PASS').length;
    _reportData.failed  = _reportData.tests.filter(t => t.status === 'FAIL').length;
    _reportData.skipped = _reportData.tests.filter(t => t.status === 'SKIP' || t.status === 'SKIPPED').length;
    _reportData.status  = _reportData.failed > 0 ? 'FAIL' : 'PASS';
  }
}

function applyReportEdits() {
  document.getElementById('reportEditorModal')?.remove();
  if (_reportData) renderReportCard(_reportData);
  showToast('✅ Rapport mis à jour');
}

function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function fmtD(ms){if(!ms||ms<0)return'—';if(ms<1000)return ms+'ms';if(ms<60000)return(ms/1000).toFixed(2)+'s';return Math.floor(ms/60000)+'m '+Math.floor((ms%60000)/1000)+'s';}

function buildInlineReport(data) {
  const _t      = t; // alias traducteur : le param 't' du .map ci-dessous masque la fonction globale
  const _loc    = currentLang === 'en' ? 'en-GB' : 'fr-FR';
  const rate    = data.total > 0 ? Math.round(data.passed / data.total * 100) : 0;
  const now     = new Date();
  const dateStr = now.toLocaleDateString(_loc,{day:'2-digit',month:'long',year:'numeric'});
  const timeStr = now.toLocaleTimeString(_loc,{hour:'2-digit',minute:'2-digit'});
  const title   = data.reportTitle || (data.isSuite ? _t('report.suitePrefix') + (data.suiteName||'') : _t('report.titleDefault'));
  const comment = data.comment || '';

  const testsHtml = data.tests.map((t, i) => {
    const icon     = t.status==='PASS'?'✅':t.status==='FAIL'?'❌':t.status==='SKIP'?'⏭️':'✅';
    const iconEn   = t.status==='PASS'?_t('report.statusPass'):t.status==='FAIL'?_t('report.statusFail'):t.status==='SKIP'?_t('report.statusSkip'):_t('report.statusPass');
    const color    = t.status==='PASS'?'#22c55e':t.status==='FAIL'?'#DC2626':t.status==='SKIP'?'#f59e0b':'#22c55e';
    const tags     = (t.tags||[]).map(tg=>`<span style="background:rgba(0,212,170,0.12);color:#00d4aa;border:1px solid rgba(0,212,170,0.25);padding:2px 8px;border-radius:10px;font-size:10px;font-family:monospace;margin:0 2px">${esc(tg)}</span>`).join('');

    const stepsHtml = (t.steps||[]).map(s => {
      const sColor = s.status==='PASS'?'#22c55e':s.status==='FAIL'?'#DC2626':s.status==='INFO'?'#60a5fa':'#94afc8';
      const sIcon  = s.status==='PASS'?'✓':s.status==='FAIL'?'✗':s.status==='INFO'?'ℹ':'○';
      const screenshot = s.screenshot ? `
        <div style="margin:8px 0">
          <div style="font-size:10px;color:#60a5fa;font-family:monospace;margin-bottom:4px">${_t('report.screenshotLabel')}</div>
          <img src="${s.screenshot}" style="max-width:100%;border-radius:6px;border:1px solid #1c2a38;cursor:pointer" onclick="this.style.maxWidth=this.style.maxWidth==='100%'?'none':'100%'" />
        </div>` : '';
      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
          <td style="padding:6px 8px;font-size:13px;color:${sColor};font-weight:600;white-space:nowrap">${sIcon}</td>
          <td style="padding:6px 8px;font-family:monospace;font-size:12px;color:#e8f0f8">${esc(s.name)} ${s.lib?`<span style="color:#94afc8;font-size:10px">(${esc(s.lib)})</span>`:''}</td>
          <td style="padding:6px 8px;font-family:monospace;font-size:11px;color:#94afc8;white-space:nowrap">${fmtD(s.duration)}</td>
          <td style="padding:6px 8px;font-size:11px;color:${s.status==='FAIL'?'#fca5a5':'#94afc8'}">${esc(s.message)}${screenshot}</td>
        </tr>`;
    }).join('');

    // Failure screenshot (top-level)
    const failScreenshot = (t.steps||[]).find(s => s.screenshot && s.status !== 'PASS');

    const failHtml = t.status==='FAIL' ? `
      <div style="background:rgba(220,38,38,0.07);border:1px solid rgba(220,38,38,0.2);border-radius:8px;padding:14px;margin:12px 0">
        <div style="font-size:11px;font-family:monospace;color:#DC2626;letter-spacing:1px;margin-bottom:8px;font-weight:700">${_t('report.failureAnalysis')}</div>
        <div style="font-size:13px;color:#fca5a5;margin-bottom:10px;line-height:1.65">${esc(t.failureAnalysis||'')}</div>
        ${t.message?`<div style="background:#060c14;border-radius:6px;padding:10px 12px;font-family:monospace;font-size:12px;color:#fca5a5;white-space:pre-wrap;word-break:break-all;margin-bottom:10px;border:1px solid rgba(220,38,38,0.15)">${esc(t.message)}</div>`:''}
        ${t.suggestion?`<div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:6px;padding:12px;font-size:13px;color:#fcd34d;line-height:1.65">
          <div style="font-size:10px;font-family:monospace;color:#f59e0b;margin-bottom:4px;letter-spacing:1px">${_t('report.suggestedFix')}</div>
          ${esc(t.suggestion)}</div>`:''}
        ${failScreenshot?`<div style="margin-top:12px"><div style="font-size:10px;font-family:monospace;color:#60a5fa;letter-spacing:1px;margin-bottom:6px">${_t('report.screenshotLabel')}</div>
          <img src="${failScreenshot.screenshot}" style="max-width:100%;border-radius:8px;border:1px solid rgba(220,38,38,0.3);cursor:pointer" onclick="this.style.maxWidth=this.style.maxWidth==='100%'?'none':'100%'" title="Cliquer pour agrandir" /></div>`:''}
      </div>` : '';

    return `
      <div style="background:#111820;border:1px solid #1c2a38;border-left:5px solid ${color};border-radius:10px;margin-bottom:12px;overflow:hidden">
        <!-- Test header -->
        <div onclick="var b=document.getElementById('tb${i}');b.style.display=b.style.display==='none'?'block':'none'"
          style="display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;background:#0d1117">
          <span style="font-size:18px">${icon}</span>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;color:#e8f0f8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:400px" title="${esc(t.name)}">${esc(t.name)}</div>
            <div style="font-size:11px;color:#94afc8;font-family:monospace;margin-top:2px">${iconEn} · ${fmtD(t.duration)}</div>
          </div>
          <div style="display:flex;gap:4px;flex-wrap:nowrap;justify-content:flex-end;overflow:hidden;max-width:300px;flex-shrink:0">${tags}</div>
          <span style="color:#94afc8;font-size:12px;margin-left:8px">▼</span>
        </div>
        <!-- Test body -->
        <div id="tb${i}" style="display:${t.status==='FAIL'?'block':'none'};padding:14px 16px;border-top:1px solid #1c2a38">
          ${failHtml}
          ${stepsHtml?`
            <div style="font-size:10px;color:#94afc8;font-family:monospace;letter-spacing:1px;margin:12px 0 6px">${_t('report.execSteps')}</div>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="border-bottom:1px solid #1c2a38">
                  <th style="padding:4px 8px;font-size:10px;color:#94afc8;font-family:monospace;text-align:left">ST</th>
                  <th style="padding:4px 8px;font-size:10px;color:#94afc8;font-family:monospace;text-align:left">STEP</th>
                  <th style="padding:4px 8px;font-size:10px;color:#94afc8;font-family:monospace;text-align:left">${_t('report.colDuration')}</th>
                  <th style="padding:4px 8px;font-size:10px;color:#94afc8;font-family:monospace;text-align:left">MESSAGE</th>
                </tr>
              </thead>
              <tbody>${stepsHtml}</tbody>
            </table>`:''}
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<base href="${location.origin}/">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#07090f; color:#e8f0f8; min-height:100vh; }
  @media print {
    body { background:#fff; color:#111; }
    .no-print { display:none !important; }
    .test-body { display:block !important; }
  }
  .page { max-width:900px; margin:0 auto; padding:28px 24px; }
  .header-bar { background:linear-gradient(135deg,#0d1117,#111820); border:1px solid #1c2a38; border-radius:12px; padding:24px 28px; margin-bottom:24px; }
  .report-title { font-size:22px; font-weight:800; color:#e8f0f8; margin-bottom:4px; }
  .report-meta { font-size:12px; color:#94afc8; font-family:monospace; margin-top:6px; }
  .badge { display:inline-block; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; font-family:monospace; }
  .badge-pass { background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.3); }
  .badge-fail { background:rgba(220,38,38,0.15); color:#DC2626; border:1px solid rgba(220,38,38,0.3); }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:12px; margin-bottom:20px; }
  .stat { background:#0d1117; border:1px solid #1c2a38; border-radius:10px; padding:16px; text-align:center; position:relative; overflow:hidden; }
  .stat::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
  .stat.s-pass::before { background:#22c55e; } .stat.s-fail::before { background:#DC2626; }
  .stat.s-total::before { background:#00d4aa; } .stat.s-dur::before { background:#94afc8; }
  .stat-n { font-size:34px; font-weight:800; line-height:1; margin-bottom:4px; }
  .stat-l { font-size:10px; color:#94afc8; font-family:monospace; letter-spacing:1px; }
  .prog { height:10px; background:#0d1117; border-radius:5px; overflow:hidden; display:flex; margin-bottom:20px; border:1px solid #1c2a38; }
  .comment-box { background:#111820; border-left:3px solid #00d4aa; border-radius:0 8px 8px 0; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#94afc8; line-height:1.65; border:1px solid #1c2a38; border-left-width:3px; }
  .section-title { font-size:11px; font-family:monospace; letter-spacing:1.5px; color:#94afc8; margin:20px 0 10px; padding-bottom:6px; border-bottom:1px solid #1c2a38; }
  .footer { margin-top:32px; padding-top:16px; border-top:1px solid #1c2a38; font-size:11px; color:#94afc8; font-family:monospace; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; }
  .print-btn { background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.3); color:#60a5fa; padding:8px 18px; border-radius:7px; font-size:12px; font-family:monospace; cursor:pointer; font-weight:600; }
  .print-btn:hover { background:rgba(59,130,246,0.22); }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header-bar">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div class="report-title">📊 ${esc(title)}</div>
        <div class="report-meta">
          ${_t('report.generatedOn')}: ${dateStr} · ${timeStr}<br>
          ${_t('report.environment')}: RoboTest·AI — Robot Framework
        </div>
      </div>
      <span class="badge ${rate===100?'badge-pass':'badge-fail'}">${rate===100?_t('report.allPass'):`❌ ${data.failed} ${_t('report.failedWord')}`}</span>
    </div>
  </div>

  <!-- Print button -->
  <div class="no-print" style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">
    <button class="print-btn" onclick="window.print()">${_t('report.print')}</button>
    ${data.logUrl ? `<a href="${data.logUrl}" target="_blank" class="print-btn no-print" style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#c084fc;text-decoration:none">${_t('report.logRf')}</a>` : ''}
    ${(data.isSuite && Array.isArray(data.blocs)) ? data.blocs.filter(b => b.logUrl).map(b => `<a href="${b.logUrl}" target="_blank" class="print-btn no-print" style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#c084fc;text-decoration:none">${_t('report.logBloc')} ${b.idx}</a>`).join('') : ''}
    <button class="print-btn" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.3);color:#22c55e" onclick="document.querySelectorAll('[id^=tb]').forEach(e=>e.style.display='block')">${_t('report.expandAll')}</button>
    <button class="print-btn" style="background:transparent;border-color:#1c2a38;color:#94afc8" onclick="document.querySelectorAll('[id^=tb]').forEach(e=>e.style.display='none')">${_t('report.collapseAll')}</button>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="stat s-total"><div class="stat-n" style="color:#00d4aa">${data.total}</div><div class="stat-l">${_t('report.statTotal')}</div></div>
    <div class="stat s-pass"><div class="stat-n" style="color:#22c55e">${data.passed}</div><div class="stat-l">${_t('report.statPassed')}</div></div>
    <div class="stat s-fail"><div class="stat-n" style="color:#DC2626">${data.failed}</div><div class="stat-l">${_t('report.statFailed')}</div></div>
    ${data.skipped>0?`<div class="stat s-dur"><div class="stat-n" style="color:#f59e0b">${data.skipped}</div><div class="stat-l">${_t('report.statSkipped')}</div></div>`:''}
    <div class="stat s-dur"><div class="stat-n" style="color:#94afc8;font-size:24px">${rate}%</div><div class="stat-l">${_t('report.statRate')}</div></div>
    <div class="stat s-dur"><div class="stat-n" style="color:#94afc8;font-size:22px">${fmtD(data.duration)}</div><div class="stat-l">${_t('report.statDuration')}</div></div>
  </div>

  <!-- Progress bar -->
  <div class="prog">
    <div style="width:${data.total?data.passed/data.total*100:0}%;background:#22c55e;transition:width .5s"></div>
    <div style="width:${data.total?data.failed/data.total*100:0}%;background:#DC2626"></div>
  </div>

  <!-- Comment -->
  ${comment?`<div class="comment-box"><span style="font-size:10px;font-family:monospace;color:#00d4aa;display:block;margin-bottom:4px">${_t('report.commentLabel')}</span>${esc(comment)}</div>`:''}

  <!-- Tests -->
  <div class="section-title">${_t('report.detailTitle')}</div>
  ${testsHtml}

  <!-- Footer -->
  <div class="footer">
    <span>RoboTest·AI</span>
    <span>${_t('report.generatedOn')} ${dateStr} ${timeStr}</span>
    <span>${_t('report.footerStack')}</span>
  </div>

</div>
</body>
</html>`;
}

function fmt(ms) {
  if (!ms || ms < 0) return '0ms';
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms/1000).toFixed(1) + 's';
  return Math.floor(ms/60000) + 'm ' + Math.floor((ms%60000)/1000) + 's';
}


// ── Run history modal ──────────────────────────────────────────────────────────

function scrollToFailed(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const iframe = card.querySelector('iframe');
  if (!iframe) return;
  // Tell iframe to expand and scroll to first failed test
  try {
    const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iDoc) return;
    // Expand all failed tests
    iDoc.querySelectorAll('[id^="tb"]').forEach((el, i) => {
      const header = el.previousElementSibling;
      if (header && header.textContent.includes('FAILED')) {
        el.style.display = 'block';
      }
    });
    // Find first failed card
    const failedCard = iDoc.querySelector('[style*="border-left: 5px solid #DC2626"], [style*="border-left:5px solid #DC2626"]');
    if (failedCard) {
      failedCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      iframe.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch(e) {
    // Cross-origin fallback: just scroll to iframe
    iframe.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function openRunHistory() {
  document.getElementById('runHistoryModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'runHistoryModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px';

  const rows = _reportHistory.map((run, i) => {
    const rate  = run.total > 0 ? Math.round(run.passed / run.total * 100) : 0;
    const color = run.failed === 0 ? '#22c55e' : '#DC2626';
    const isLast = i === _reportHistory.length - 1;
    return `<tr style="border-bottom:1px solid var(--border);${isLast?'background:rgba(0,212,170,0.04)':''}">
      <td style="padding:10px 12px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--gray)">#${run.runNumber||i+1}</td>
      <td style="padding:10px 12px;font-size:12px;color:var(--text)">${run.runDate||'—'}</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:${color}">${run.passed}/${run.total}</td>
      <td style="padding:10px 12px;font-size:13px;font-weight:700;color:${color}">${rate}%</td>
      <td style="padding:10px 12px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--gray)">${fmtDuration(run.duration)}</td>
      <td style="padding:10px 12px">
        <button onclick="loadHistoryRun(${i})"
          style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          Voir
        </button>
      </td>
    </tr>`;
  }).reverse().join('');

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:680px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">📜 Historique des exécutions</span>
        <button onclick="document.getElementById('runHistoryModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer" title="Fermer">✕</button>
      </div>
      <div style="overflow-y:auto;flex:1">
        ${_reportHistory.length === 0
          ? '<div style="padding:32px;text-align:center;color:var(--gray);font-size:14px">Aucune exécution enregistrée</div>'
          : `<table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="border-bottom:1px solid var(--border);background:var(--card)">
                  <th style="padding:8px 12px;font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;text-align:left;letter-spacing:1px">RUN</th>
                  <th style="padding:8px 12px;font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;text-align:left;letter-spacing:1px">DATE</th>
                  <th style="padding:8px 12px;font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;text-align:left;letter-spacing:1px">RÉSULTATS</th>
                  <th style="padding:8px 12px;font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;text-align:left;letter-spacing:1px">TAUX</th>
                  <th style="padding:8px 12px;font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;text-align:left;letter-spacing:1px">DURÉE</th>
                  <th style="padding:8px 12px;font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;text-align:left"></th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>`}
      </div>
      <div style="padding:12px 20px;border-top:1px solid var(--border);background:var(--card);display:flex;gap:8px">
        <button onclick="clearRunHistory()"
          style="background:rgba(230,57,70,0.08);border:1px solid var(--red);color:var(--red);padding:7px 16px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          🗑️ Effacer l'historique
        </button>
        <button onclick="document.getElementById('runHistoryModal').remove()"
          style="margin-left:auto;background:transparent;border:1px solid var(--border);color:var(--gray);padding:7px 16px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          Fermer
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);
}

function loadHistoryRun(idx) {
  document.getElementById('runHistoryModal')?.remove();
  const run = _reportHistory[idx];
  if (run) {
    _reportData = JSON.parse(JSON.stringify(run));
    renderReportCard(run);
    showToast(`📜 Run #${run.runNumber} chargé`);
  }
}

function clearRunHistory() {
  _reportHistory = [];
  try { localStorage.removeItem('qa_run_history'); } catch(e) {}
  document.getElementById('runHistoryModal')?.remove();
  showToast('🗑️ Historique effacé');
}

function fmtDuration(ms) {
  if (!ms || ms < 0) return '0ms';
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms/1000).toFixed(1) + 's';
  return Math.floor(ms/60000) + 'm ' + Math.floor((ms%60000)/1000) + 's';
}
// ── Delete report card ────────────────────────────────────────────────────────
function deleteReportCard(cardId, runNum) {
  showConfirmDialog('🗑 Supprimer le rapport', 'Supprimer le rapport <b>RUN #' + runNum + '</b> ?', () => {
    // Remove from DOM
    document.getElementById(cardId)?.remove();
    // Purge le registre de re-render i18n + révoque le blob
    if (window._openReports && window._openReports[cardId]) {
      try { URL.revokeObjectURL(window._openReports[cardId].blobUrl); } catch(e) {}
      delete window._openReports[cardId];
    }
    // Remove from _codeCards — filter by cardId (reliable) AND runNum (fallback)
    window._codeCards = (window._codeCards||[]).filter(c => {
      if (c.cardId === cardId) return false;
      if (c.cardId === 'suite-report-' + runNum) return false;
      return true;
    });
    // Remove from _reportHistory
    _reportHistory = (_reportHistory||[]).filter(r => r.runNumber !== runNum);
    // Persiste
    saveCodeCards();
    deleteFromDB(cardId);
    deleteFromDB('suite-report-' + runNum);
    updateStatsBar();
    showToast('🗑 Rapport supprimé');
  });
}

// ── Render consolidated suite report (restore from localStorage) ─────────────
function renderConsolidatedSuiteReport(card) {
  // Use saved data directly if available (preserves real TC names)
  if (card.data) {
    renderReportCard(card.data);
    return;
  }
  // Fallback: rebuild from blocs
  const suiteTitle = card.suiteTitle || 'Suite';
  const tests = card.tests || (card.blocs||[]).flatMap(b =>
    Array.from({length: b.total||0}, (_, i) => ({
      name: b.name ? b.name + ' TC_' + String(i+1).padStart(3,'0') : 'TC_' + String(i+1).padStart(3,'0'),
      status: i < (b.passed||0) ? 'PASS' : 'FAIL',
      duration: 0,
      tags: []
    }))
  );
  const merged = {
    status:      (card.failed||0) === 0 ? 'PASS' : 'FAIL',
    total:       card.total   || 0,
    passed:      card.passed  || 0,
    failed:      card.failed  || 0,
    duration:    (card.blocs||[]).reduce((s,b) => s+(b.duration||0), 0),
    tests,
    blocs:       card.blocs || [],
    runType:     'suite',
    environment: 'RoboTest·AI — Robot Framework',
    reportTitle: 'Rapport de Tests Automatisés',
    runNumber:   card.cardId,
    suiteName:   suiteTitle,
    isSuite:     true,
  };
  renderReportCard(merged);
}


function deleteConsolidatedReport(cardId) {
  showConfirmDialog('🗑 Supprimer le rapport', 'Supprimer ce rapport de suite ?', () => {
    // Remove from DOM — le rapport suite est rendu via renderReportCard avec un cardId différent
    document.getElementById(cardId)?.remove();
    // Cherche aussi le reportCard associé dans le DOM (reportCard-XXX)
    document.querySelectorAll('[id^="reportCard-"]').forEach(el => {
      // Supprime les reportCards créés depuis ce suite-report
      if (el.dataset.suiteCardId === cardId) el.remove();
    });
    // Supprime de _codeCards : le suite-report ET le report lié
    window._codeCards = (window._codeCards||[]).filter(c => {
      if (c.cardId === cardId) return false;
      if (c.suiteCardId === cardId) return false;
      return true;
    });
    // Supprime aussi le reportCard du DOM (dataset.suiteCardId en JS = data-suite-card-id en HTML)
    document.querySelectorAll('[id^="reportCard-"]').forEach(el => {
      if (el.dataset.suiteCardId === cardId) el.remove();
    });
    saveCodeCards();
    deleteFromDB(cardId);
    updateStatsBar();
    showToast('🗑 Rapport supprimé');
  });
}

function savePopupPref(val) {
  try { localStorage.setItem('qa_block_popups', val); } catch(e) {}
}

function shouldBlockPopups() {
  return (document.getElementById('optBlockPopups')?.value || localStorage.getItem('qa_block_popups') || 'block') === 'block';
}

// ── Render consolidated suite report inline ───────────────────────────────────
function renderConsolidatedSuiteReport_inline() {
  const suiteReports = window._suiteBloc_reports || [];
  if (suiteReports.length === 0) return;
  window._suiteBloc_reports = [];

  const suiteTitle = window._currentSuiteTitle || suiteReports[0]?.suiteName?.replace(/ \[\d+\/\d+\]$/, '') || 'Suite';
  // #2 : un lien log par bloc (logUrl renvoyé par le serveur pour chaque bloc)
  const blocs = suiteReports.map((r, i) => ({
    idx: i + 1, name: r.suiteName || '',
    total: r.total || 0, passed: r.passed || 0, failed: r.failed || 0,
    duration: r.duration || 0, logUrl: r.logUrl || '',
  }));
  const merged = {
    status:      suiteReports.some(r => r.status === 'FAIL') ? 'FAIL' : 'PASS',
    total:       suiteReports.reduce((s, r) => s + (r.total   || 0), 0),
    passed:      suiteReports.reduce((s, r) => s + (r.passed  || 0), 0),
    failed:      suiteReports.reduce((s, r) => s + (r.failed  || 0), 0),
    duration:    suiteReports.reduce((s, r) => s + (r.duration|| 0), 0),
    tests:       suiteReports.flatMap(r => (r.tests || []).map(t => ({...t}))),
    runType:     suiteReports[0]?.runType || 'web',
    environment: 'RoboTest·AI — Robot Framework',
    reportTitle: 'Rapport de Tests Automatisés',
    runNumber:   Date.now(),
    runDate:     new Date().toLocaleString('fr-FR'),
    createdAt:   new Date().toISOString(),
    suiteName:   suiteTitle,
    isSuite:     true,
    blocs,
  };

  // Broadcaster la fin de suite dans le live panel
  fetch('/api/rf/live-suite-end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: suiteTitle,
      status: merged.status?.toLowerCase() || 'fail',
      passed: merged.passed, failed: merged.failed, total: merged.total,
    }),
  }).catch(() => {});
  // Calcul blockNames avant renderReportCard pour les badges
  const _suite = (savedSuites||[]).find(s => s.title === suiteTitle);
  merged.blockNames = _suite
    ? ((_suite.testIds||[]).map(id => (suiteRegistry||[]).find(t => t.id === id)?.name).filter(Boolean))
    : suiteReports.map(r => r.suiteName?.replace(/ \[\d+\/\d+\]$/, '')||'').filter(Boolean);

  // Use the exact same renderReportCard as individual reports
  renderReportCard(merged, 'suite-report-' + merged.runNumber);

  // Persist
  window._codeCards = window._codeCards || [];
  window._codeCards.push({
    type: 'suite-report', cardId: 'suite-report-' + merged.runNumber,
    suiteTitle,
    total: merged.total, passed: merged.passed, failed: merged.failed,
    rate: merged.total > 0 ? Math.round(merged.passed/merged.total*100) : 0,
    blocs,
    blockNames: [],
    tests: merged.tests,
    data: merged,
    createdAt: new Date().toISOString()
  });
  // Calcul blockNames après création de l'objet
  const _suiteCard = window._codeCards[window._codeCards.length - 1];
  if (_suiteCard && _suiteCard.type === 'suite-report') {
    const _suite = (savedSuites||[]).find(s => s.title === suiteTitle);
    if (_suite) {
      _suiteCard.blockNames = (_suite.testIds||[])
        .map(id => (suiteRegistry||[]).find(t => t.id === id)?.name)
        .filter(Boolean);
    }
    if (!_suiteCard.blockNames?.length) {
      _suiteCard.blockNames = suiteReports
        .map(r => r.suiteName?.replace(/ \[\d+\/\d+\]$/, '')||'')
        .filter(Boolean);
    }
    console.log('[blockNames]', _suiteCard.blockNames);
  }
  saveCodeCards();
}
