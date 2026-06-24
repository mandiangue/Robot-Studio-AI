// ============================================================================
// run.js — exécution des tests (addRunButton, runTests, runTestsFromCard),
//          pause/resume/stop, mode debug, bouton Run (handleRunBtn/setRunBtn).
// ============================================================================

let _lastGeneratedCode = null;
let _lastGeneratedFile = 'test_generated';

// Run button injected directly in renderResultCard

function addRunButton(code, filename) {
  const messages = document.getElementById('messages');
  const lastMsg  = messages.lastElementChild;
  if (!lastMsg) return;
  const bubble = lastMsg.querySelector('.msg-bubble');
  if (!bubble || bubble.querySelector('.run-tests-btn')) return;

  const runBar = document.createElement('div');
  runBar.style.cssText = 'margin-top:12px;display:flex;gap:8px;flex-wrap:wrap';
  runBar.innerHTML = `
    <button class="run-tests-btn"
      style="background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#07090f;padding:10px 20px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.5px"
      onclick="runTests(${JSON.stringify(code).replace(/"/g,'&quot;')}, '${filename}')">
      ${t('run.launch')}
    </button>`;
  bubble.appendChild(runBar);
}


// ── runTests — called from old-style onclick buttons ─────────────────────────
async function runTests(btnOrCode, filename) {
  let code, fname;
  if (typeof btnOrCode === 'string') {
    code  = btnOrCode;
    fname = filename || 'test_generated.robot';
  } else {
    // btn element
    code  = decodeURIComponent(btnOrCode?.dataset?.code || '');
    fname = decodeURIComponent(btnOrCode?.dataset?.filename || 'test_generated.robot');
  }
  // Sync les fichiers sur disque avant le run
  if (window._lastCardId) await syncCardFilesToDisk(window._lastCardId);
  if (code) await runTestsFromCard(code, fname);
}

async function syncCardFilesToDisk(cardId) {
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card?.files) return;
  await Promise.all(card.files.map(f => {
    if (!f.filename || !f.code) return Promise.resolve();
    return fetch('/api/rf/write-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filepath: f.filename, content: f.code }),
    }).catch(() => {});
  }));
}

async function runTestsFromCard(code, filename, suiteCtx) {
  // Bloquer si un run est deja en cours
  if (window._rfRunning && !suiteCtx?.isSuite) {
    showToast(t('run.alreadyRunning'));
    return;
  }
  window._rfRunning = true;
  const apiKey = document.getElementById('apiKey').value.trim();
  const isSuiteRun = suiteCtx?.isSuite;

  // Store immediately so Debug/Replay can use during run
  window._lastGeneratedCode = code;
  window._lastGeneratedFile = (filename || 'test_generated').replace('.robot', '');
  window._lastRunType = detectRunType(code);
  // Track which card is being run for variables.robot snapshot
  // Match by cardId passed in filename (result-TIMESTAMP)
  const cardIdFromFile = (filename||'').match(/result-\d+/);
  if (cardIdFromFile) {
    window._lastCardId = cardIdFromFile[0];
  } else {
    const runningCard = (window._codeCards||[]).find(c => c.files?.some(f => f.code === code));
    if (runningCard) window._lastCardId = runningCard.cardId;
  }
  // Persist for page refresh
  try {
    localStorage.setItem('qa_last_code',    code);
    localStorage.setItem('qa_last_file',    window._lastGeneratedFile);
    localStorage.setItem('qa_last_runtype', window._lastRunType);
    localStorage.setItem('qa_last_filename', filename || 'test_generated.robot');
  } catch(e) {}

  // Detect run type from library
  function detectRunType(code) {
    if (!code) return 'web';
    if (code.includes('AppiumLibrary'))    return 'mobile';
    if (code.includes('RequestsLibrary')) return 'api';
    if (code.includes('DatabaseLibrary')) return 'database';
    return 'web';
  }
  const runType  = detectRunType(code);
  const runTypeLabels = {
    mobile:   t('run.typeMobile'),
    api:      t('run.typeApi'),
    database: t('run.typeDatabase'),
    web:      t('run.typeWeb'),
  };
  const runTypeBadge = runTypeLabels[runType] || t('run.typeWeb');
  const runLabel = isSuiteRun ? '🧪 Suite : **' + suiteCtx.suiteName + '**' : runTypeBadge;
  const runMsgId  = 'runMsg-' + Date.now();
  const runMsgDiv = document.createElement('div');
  runMsgDiv.className = 'msg agent';
  runMsgDiv.id = runMsgId;
  const _sn = (suiteCtx?.tests || []).length;
  const runLabel2 = isSuiteRun
    ? (_sn>1?t('run.suiteLabelMany'):t('run.suiteLabelOne')).replace('{name}', '<strong>'+escHtml(suiteCtx.suiteName||'')+'</strong>').replace('{n}', _sn)
    : runTypeBadge + ' ' + t('run.testRun');
  // Only show "en cours" message for non-suite runs
  if (!isSuiteRun) {
    runMsgDiv.innerHTML =
      '<div class="msg-avatar">🤖</div>' +
      '<div class="msg-body"><div class="msg-bubble" style="padding:10px 14px">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<span id="' + runMsgId + '-label" style="font-size:13px;font-weight:600">' + t('run.testInProgress').replace('{label}', runLabel2) + '</span>' +
      '<button onclick="stopTestRun()" style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);color:var(--red);padding:3px 10px;border-radius:5px;font-size:11px;font-family:monospace;cursor:pointer">' + t('run.stop') + '</button>' +
      '</div>' +
      '</div></div>';
    localStorage.setItem('qa_active_run', JSON.stringify({ runMsgId, label: runLabel2 }));
    document.getElementById('messages').appendChild(runMsgDiv);
    scrollToBottom();
  }
  // For suite runs, don't append runMsgDiv (progress handled by suiteProgressDiv)

  window._currentRunMsgId = runMsgId;

  // Store ref to update status when done
  window._currentRunMsg = runMsgDiv;

  try {
    const browserType = document.getElementById('optBrowserType')?.value || 'chrome';
    const headless = document.getElementById('optHeadless')?.value === 'headless';
    const r    = await fetch('/api/rf/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, filename: filename?.replace('.robot','') || 'test', headless, browserType, pageTitle: window._lastGeneratedTitle || '', suiteFilter: window._runSuiteFilter || null }),
    });
    const data = await r.json();
    hideTyping();
    if (data && data.stopped === true) { window._currentRunMsg = null; return; }

    if (!r.ok) {
      renderAgentMsg(t('run.launchError') + '\n\n' + data.error + '\n\n' + (data.details || ''));
      return;
    }

    // Show summary in chat — skip for suite blocs (consolidated report shown at end)
    if (!suiteCtx?.isSuite) {
      const icon    = data.status === 'PASS' ? '✅' : '❌';
      const rate    = data.total > 0 ? Math.round(data.passed / data.total * 100) : 0;
      const summary = (data.passed>1?t('run.resultMany'):t('run.resultOne'))
        .replace('{icon}',icon).replace('{status}',data.status).replace('{p}',data.passed).replace('{tot}',data.total).replace('{rate}',rate).replace('{dur}',fmtDuration(data.duration));
      renderAgentMsg(summary + '\n\n' + t('run.reportBelow'));
    }

    // Note: snapshot variables.robot désactivé après run — évite d'écraser les cartes de suite

    // Open full report — skip individual cards for suite blocs
    if (!suiteCtx?.isSuite) {
      openTestReport(data, suiteCtx);
    } else {
      // Accumulate for consolidated report
      window._suiteBloc_reports = window._suiteBloc_reports || [];
      window._suiteBloc_reports.push(JSON.parse(JSON.stringify(data)));
      // Check if all blocs are done
      if (window._suiteTotal && window._suiteBloc_reports.length >= window._suiteTotal) {
        renderConsolidatedSuiteReport_inline();
      }
    }

    chatHistory.push({ role: 'assistant', content: `[Test run: ${data.status} ${data.passed}/${data.total}]` });
    window._rfRunning = false;
    LS.save();

  } catch(err) {
    hideTyping();
    window._rfRunning = false;
    if (err.message.includes('fetch') || err.message.includes('Failed')) {
      renderAgentMsg(t('run.proxyDown'));
    } else {
      renderAgentMsg(t('run.errorPrefix') + err.message);
    }
  }
}
// ── Pause test run for debug ──────────────────────────────────────────────────
// RF runs in a terminal process — pause injects a breakpoint file
let _rfPaused = false;

function pauseTestRun(btn) {
  _rfPaused = true;
  btn.textContent = t('run.resume');
  btn.style.background = 'rgba(34,197,94,0.12)';
  btn.style.borderColor = 'rgba(34,197,94,0.35)';
  btn.style.color = 'var(--green)';
  btn.onclick = () => resumeTestRun(btn);

  // Ask server to create a pause flag file
  fetch('/api/rf/pause', { method: 'POST' }).catch(() => {});

  const msg = btn.closest('.msg-bubble');
  const info = document.createElement('div');
  info.id = 'pauseInfo';
  info.style.cssText = 'margin-top:10px;padding:10px 12px;background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:7px;font-size:12px;font-family:IBM Plex Mono,monospace;color:var(--warn);line-height:1.6';
  info.innerHTML = t('run.debugInfo');
  msg.appendChild(info);
  showToast(t('run.pauseActivated'));
}

function resumeTestRun(btn) {
  _rfPaused = false;
  btn.textContent = t('run.pause');
  btn.style.background = 'rgba(245,158,11,0.12)';
  btn.style.borderColor = 'rgba(245,158,11,0.35)';
  btn.style.color = 'var(--warn)';
  btn.onclick = () => pauseTestRun(btn);
  document.getElementById('pauseInfo')?.remove();
  fetch('/api/rf/resume', { method: 'POST' }).catch(() => {});
  showToast(t('run.resumed'));
}

function stopTestRun() {
  window._suiteStopped = true; // Stop suite loop
  fetch('/api/rf/stop', { method: 'POST' })
    .then(r => r.json())
    .then(d => {
      if (d.stopped) showToast(t('run.runStoppedToast'));
      else showToast(t('run.noActiveRun'));
    })
    .catch(() => showToast(t('run.stopError')));
  hideTyping();
  window._rfRunning = false;
  var _rm = window._currentRunMsg;
  if (_rm) {
    var _lbl = _rm.querySelector('[id$="-label"]');
    if (_lbl) _lbl.innerHTML = t('run.runStopped');
    var _btn = _rm.querySelector('button');
    if (_btn) _btn.remove();
  }
  window._currentRunMsg = null;
  try { localStorage.removeItem('qa_active_run'); } catch(e) {}
}
// ── Debug mode — add Pause Execution before failed keyword ───────────────────
async function activateDebugMode() {
  const code = window._lastGeneratedCode;
  if (!code) { showToast(t('run.noCodeFound')); return; }

  // Check if Dialogs library is installed — offer to install if not
  try {
    const check = await fetch('/api/check-library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ library: 'Dialogs' })
    });
    const result = await check.json();
    if (!result.installed) {
      if (confirm(t('run.dialogsConfirm'))) {
        installLibrary('Dialogs');
        return;
      }
      return;
    }
  } catch(e) {}

  // Check if Dialogs library is imported
  let debugCode = code;
  if (!debugCode.includes('Dialogs')) {
    debugCode = debugCode.replace(
      /^(\*\*\* Settings \*\*\*[^\n]*\n)/m,
      '$1Library    Dialogs\n'
    );
  }

  // Add Pause Execution before first keyword call in first test case
  let inserted = false;
  const lines = debugCode.split('\n');
  let inTests = false;
  let inFirstTest = false;
  const result = lines.map(line => {
    if (line.startsWith('*** Test Cases')) { inTests = true; return line; }
    if (line.startsWith('***') && inTests) { inTests = false; return line; }
    if (inTests && line.match(/^[A-Za-z]/)) {
      inFirstTest = !inserted;
      return line;
    }
    if (inFirstTest && !inserted && line.match(/^    [A-Za-z]/)) {
      inserted = true;
      return '    Pause Execution    msg=🐛 Debug — inspecte le navigateur, clique OK pour continuer\n' + line;
    }
    return line;
  });

  debugCode = result.join('\n');
  window._lastGeneratedCode = debugCode;

  // Stop current run first
  await stopTestRun();
  await new Promise(r => setTimeout(r, 800)); // wait for stop

  // Replace current run message instead of creating a new one
  const currentMsg = window._currentRunMsg || document.getElementById(window._currentRunMsgId);
  if (currentMsg) currentMsg.remove();

  showToast(t('run.debugActivated'));

  const filename = (window._lastGeneratedFile || 'test_generated') + '.robot';
  runTestsFromCard(debugCode, filename);
}


// ── Run button handler (Stop ↔ Replay) ───────────────────────────────────────
function handleRunBtn(btn) {
  const state = btn.dataset.state;
  if (state === 'stop') {
    showToast(t('run.stopping'));
    stopTestRun();
    setRunBtn(btn, 'replay');
    const lbl = document.getElementById(btn.dataset.runid + '-label');
    if (lbl) { lbl.textContent = t('run.stopped'); lbl.style.color = 'var(--gray)'; }
    localStorage.removeItem('qa_active_run');
  } else {
    const code = window._lastGeneratedCode
      || localStorage.getItem('qa_last_code');
    const file = localStorage.getItem('qa_last_filename')
      || (window._lastGeneratedFile || 'test_generated') + '.robot';
    if (!code) { showToast(t('run.noReplay')); return; }
    window._lastGeneratedCode = code;
    runTestsFromCard(code, file);
  }
}

function setRunBtn(btn, state) {
  if (!btn) return;
  btn.dataset.state = state;
  if (state === 'stop') {
    btn.textContent = t('run.stop');
    btn.style.background = 'rgba(220,38,38,0.12)';
    btn.style.border = '1px solid rgba(220,38,38,0.35)';
    btn.style.color = 'var(--red)';
  } else {
    btn.textContent = t('run.replay');
    btn.style.background = 'rgba(0,212,170,0.1)';
    btn.style.border = '1px solid var(--teal)';
    btn.style.color = 'var(--teal)';
  }
}
