// ============================================================================
// suiterun.js — groupes de suite (création/exécution/réorganisation) + drag&drop
//               + resize du panneau suite. Extrait de qa-agent.js.
// ============================================================================

// ── Suite group management ────────────────────────────────────────────────────
function addNewSuiteGroup() {
  cleanSuiteRegistry(); // nettoie avant d'afficher
  const cards = (window._codeCards||[]).filter(c => c.type !== 'report' && c.type !== 'suite-report' && c.cardId);
  if (cards.length === 0) {
    showToast(t('suiterun.genCodeFirst'));
    return;
  }

  // Show picker modal to select code cards for this suite
  document.getElementById('_suitePickerModal')?.remove();
  const modal = document.createElement('div');
  modal.id = '_suitePickerModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';

  const _fmtDate = (cardId, card) => { let ts=null; const m=String(cardId||'').match(/(\d{10,})/); if(m) ts=parseInt(m[1]); if((!ts||isNaN(ts))&&card&&card.createdAt) ts=new Date(card.createdAt).getTime(); if(!ts||isNaN(ts)) return ''; try { return new Date(ts).toLocaleString(currentLang==='en'?'en-GB':'fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',',''); } catch(e){ return ''; } };
  const rows = cards.map((card, i) => {
    const title = card.title || card.files?.[0]?.filename?.replace('.robot','') || 'Bloc ' + (i+1);
    const fileCount = card.files?.length || 0;
    const dateStr = _fmtDate(card.cardId, card);
    return `<label style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--card);
              border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer"
              onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
      <input type="checkbox" value="${i}" class="suite-picker-cb" style="accent-color:var(--teal);width:16px;height:16px;cursor:pointer" />
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text)">${escHtml(title)}</div>
        <div style="font-size:11px;color:var(--gray)">${(fileCount>1?t('suiterun.fileCountMany'):t('suiterun.fileCountOne')).replace('{n}', fileCount)}${dateStr ? ' \u00b7 \ud83d\udd5b ' + dateStr : ''}</div>
      </div>
      <span onclick="event.preventDefault();event.stopPropagation();this.closest('label').remove()" title="${t('suiterun.removeFromList')}" style="cursor:pointer;color:var(--gray);font-size:16px;padding:2px 8px;border-radius:5px;flex-shrink:0" onmouseover="this.style.color='#ff5c5c'" onmouseout="this.style.color='var(--gray)'">\u2715</span>
    </label>`;
  }).join('');

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:480px">
      <div style="display:flex;align-items:center;padding:16px 20px;background:var(--card);border-bottom:1px solid var(--border)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">${t('suiterun.createSuiteTitle')}</span>
        <button onclick="document.getElementById('_suitePickerModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="padding:14px 20px">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:12px">
          ${t('suiterun.selectBlocks')}
        </div>
        <div style="max-height:320px;overflow-y:auto">${rows}</div>
      </div>
      <div style="display:flex;gap:10px;padding:14px 20px;border-top:1px solid var(--border);background:var(--card)">
        <button id="_suitePickerCreate"
          style="flex:1;background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;
                 padding:10px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          ${t('suiterun.createSuiteBtn')}
        </button>
        <button onclick="document.getElementById('_suitePickerModal').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:10px 16px;
                 border-radius:8px;font-size:13px;cursor:pointer">
          ${t('suiterun.cancel')}
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  document.getElementById('_suitePickerCreate').onclick = () => {
    const checked = [...document.querySelectorAll('.suite-picker-cb:checked')];
    if (checked.length === 0) { showToast(t('suiterun.selectOneBlock')); return; }

    const n = savedSuites.length + 1;
    const newSuite = { id: 'S' + Date.now(), title: 'Suite ' + n, testIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    savedSuites.push(newSuite);

    checked.forEach(cb => {
      const card = cards[parseInt(cb.value)];
      if (!card) return;
      const title = card.title || card.files?.[0]?.filename?.replace('.robot','') || 'Test';
      const mainFile = _findTestFile(card.files);
      const code = mainFile?.code || '';
      const id = generateSuiteId();

      // Build pomCode for post-reload use
      let pomCode = '';
      if (card.files?.some(f => f.code?.trim())) {
        const fname = 'suite_PLACEHOLDER_' + id + '.robot';
        const pomLines = card.files
          .filter(f => f.code?.trim() && !_isTestFile(f))
          .map(f => {
            const relPath = f.filename.replace(/^.*rf_tests[/\\]/, '').replace(/\\/g, '/');
            const label = relPath.split('/').pop().replace('.robot','');
            return '***** FILE: ' + relPath + ' | ' + label + ' | suite bloc | ' + title + '\n' + f.code;
          });
        pomLines.push('***** FILE: tests/' + fname + ' | tests | suite bloc | ' + title + '\n' + code);
        pomCode = pomLines.join('\n\n');
      }

      suiteRegistry.push({ id, cardId: card.cardId, name: title, filename: (mainFile?.filename||'tests.robot').split('/').pop(), code, pomCode, addedAt: new Date().toISOString(), droppedIntoGroup: true });
      newSuite.testIds.push(id);
    });

    saveSuitesList();
    saveSuiteRegistry();
    renderSavedSuites();
    renderSuiteTestList();
    modal.remove();
    showToast((checked.length>1?t('suiterun.suiteCreatedMany'):t('suiterun.suiteCreatedOne')).replace('{n}', checked.length));
  };
}

function updateSuiteGroupTitle(idx, val) {
  if (savedSuites[idx]) { savedSuites[idx].title = val; savedSuites[idx].updatedAt = new Date().toISOString(); saveSuitesList(); }
}

function deleteSuiteGroup(idx) {
  const suite = savedSuites[idx];
  if (!suite) return;
  showConfirmDialog(t('suiterun.deleteSuiteTitle'), t('suiterun.deleteSuiteBody').replace('{title}', escHtml(suite.title)), () => {
    savedSuites.splice(idx, 1);
    saveSuitesList();
    // Supprimer aussi les suite-reports liés dans MongoDB
    const relatedCards = (window._codeCards||[]).filter(c => c.type === 'suite-report' && c.suiteTitle === suite.title);
    relatedCards.forEach(c => deleteFromDB(c.cardId));
    window._codeCards = (window._codeCards||[]).filter(c => !(c.type === 'suite-report' && c.suiteTitle === suite.title));
    saveCodeCards();
    renderSavedSuites();
    showToast(t('suiterun.suiteDeleted'));
  });
}

function addTestToSuite(suiteIdx) {
  const sel = document.getElementById('addTestSelect_' + suiteIdx);
  if (!sel || !sel.value) return;
  const tid = sel.value;
  if (!savedSuites[suiteIdx].testIds.includes(tid)) {
    savedSuites[suiteIdx].testIds.push(tid);
    savedSuites[suiteIdx].updatedAt = new Date().toISOString();
    saveSuitesList();
    renderSavedSuites();
  }
}

function removeTestFromSuite(suiteIdx, tid) {
  if (!savedSuites[suiteIdx]) return;
  savedSuites[suiteIdx].testIds = savedSuites[suiteIdx].testIds.filter(id => id !== tid);
  savedSuites[suiteIdx].updatedAt = new Date().toISOString();
  saveSuitesList();
  renderSavedSuites();
}


function stopSuiteGroup(suiteId) {
  window._suiteStopped = true;
  stopTestRun();
  // Remettre le bouton run
  const runBtn  = document.getElementById('runBtn-' + suiteId);
  const stopBtn = document.getElementById('stopBtn-' + suiteId);
  if (runBtn)  runBtn.style.display  = 'inline-flex';
  if (stopBtn) stopBtn.style.display = 'none';
  const _stoppedSuite = savedSuites.find(s => s.id === suiteId);
  showToast(t('suiterun.suiteStopped').replace('{title}', _stoppedSuite?.title || suiteId));
}
async function runSuiteGroup(idx) {
  if (window._suiteRunning) {
    // Ask user if they want to force restart
    showToast(t('suiterun.suiteAlreadyRunning'));
    return;
  }
  window._suiteRunning = true;
  const suite = savedSuites[idx];
  if (!suite) { window._suiteRunning = false; return; }

  // Deduplicate by cardId, respect suite order
  const seenCards = new Set();
  const tests = suite.testIds
    .map(id => suiteRegistry.find(t => t.id === id))
    .filter(t => {
      if (!t || !t.code || t.enabled === false) return false;
      const key = t.cardId || t.id;
      if (seenCards.has(key)) return false;
      seenCards.add(key);
      return true;
    });

  if (tests.length === 0) { showToast(t('suiterun.noTestInSuite')); return; }

  window._suiteBloc_reports = []; // reset
  window._suiteTotal = tests.length;
  window._suiteStopped = false;
  window._currentSuiteTitle = suite.title;
  // Live broadcast suite-start
  fetch('/api/rf/live-suite-start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: suite.title, blocCount: tests.length }),
  }).catch(() => {});
  // Afficher bouton stop, cacher bouton run
  const _runBtn  = document.getElementById('runBtn-' + suite.id);
  const _stopBtn = document.getElementById('stopBtn-' + suite.id);
  if (_runBtn)  _runBtn.style.display  = 'none';
  if (_stopBtn) _stopBtn.style.display = 'inline-flex';

  // Create ONE progress message for the whole suite
  const suiteProgressDiv = document.createElement('div');
  suiteProgressDiv.className = 'msg agent';
  suiteProgressDiv.style.cssText = 'width:100%';
  suiteProgressDiv.innerHTML =
    '<div class="msg-avatar">🤖</div>' +
    '<div class="msg-body"><div class="msg-bubble" style="padding:10px 14px">' +
    '<span id="suite-progress-label" style="font-size:13px;font-weight:600">' + escHtml(t('suiterun.progressStart').replace('{title}', suite.title).replace('{n}', tests.length)) + '</span>' +
    '</div></div>';
  document.getElementById('messages').appendChild(suiteProgressDiv);
  suiteProgressDiv.scrollIntoView({ behavior: 'smooth' });

  // Run each bloc sequentially in suite order
  window._suiteStopped = false;
  try {
  for (let i = 0; i < tests.length; i++) {
    if (window._suiteStopped) { showToast(window.t('suiterun.suiteStoppedShort')); break; }
    // Update progress label using the specific div for this run
    const lbl = suiteProgressDiv.querySelector('#suite-progress-label');
    if (lbl) lbl.textContent = window.t('suiterun.progressRunning').replace('{title}', suite.title).replace('{i}', i+1).replace('{n}', tests.length);
    const t = tests[i];

    const fname = 'suite_' + suite.id + '_' + (i+1) + '.robot';
    // Build POM multi-file code from all saved card files
    let suiteCode = t.code;
    const card = (window._codeCards||[]).find(c => c.cardId === t.cardId);
    // Use pre-built POM code if card files are not in memory (after reload)
    const hasFullFiles = card?.files?.some(f => f.code?.trim() && (f.filename.includes('variables') || f.filename.includes('keywords')));
    if (card?.files?.length > 1 && hasFullFiles) {
      // Send all resource files + THIS bloc's test code (not the shared tests.robot)
      const pomLines = card.files
        .filter(f => f.code?.trim() && !_isTestFile(f))  // skip shared tests
        .map(f => {
          let relPath = f.filename.replace(/^.*rf_tests[/\\]/, '').replace(/\\/g, '/');
          const label = relPath.split('/').pop().replace('.robot','');
          return '***** FILE: ' + relPath + ' | ' + label + ' | suite bloc | ' + t.name + '\n' + f.code;
        });
      // Use THIS bloc's own test code
      pomLines.push('***** FILE: tests/' + fname + ' | tests | suite bloc | ' + t.name + '\n' + t.code);
      suiteCode = pomLines.join('\n\n');
    } else if (t.pomCode && t.pomCode.includes('***** FILE:')) {
      // Use pre-built POM code from registry (available after page reload)
      suiteCode = t.pomCode.replace(/suite_PLACEHOLDER_/g, 'suite_' + suite.id + '_' + (i+1) + '_');
    } else {
      // Fallback: inline variables only
      const savedVars = card?.files?.find(f => f.filename.includes('variables.robot') && f.code?.includes('*** Variables ***'));
      if (savedVars?.code) {
        const varContent = savedVars.code.match(/\*{3}\s*Variables[^\n]*\n((?:(?!\*{3})[\s\S])*)/);
        if (varContent) {
          const varLines = varContent[1];
          suiteCode = suiteCode.replace(/^Resource[^\n]*variables\.robot[^\n]*$/gm, '');
          if (!suiteCode.includes('*** Variables ***')) {
            suiteCode = suiteCode.replace(/(\*{3}\s*Settings[^\n]*\n)/, '$1*** Variables ***\n' + varLines + '\n');
          }
            }
      } else {
        }
    }
    // Override headless for this suite
    const savedHeadless = document.getElementById('optHeadless')?.value;
    if (document.getElementById('optHeadless')) document.getElementById('optHeadless').value = suite.headless || 'visible';
    window._lastGeneratedTitle = t.name;
    await runTestsFromCard(suiteCode, fname, {
      isSuite: true,
      suiteName: suite.title + ' [' + (i+1) + '/' + tests.length + ']',
      tests: [{ id: t.id, name: t.name }]
    });
    // Restore headless setting
    if (document.getElementById('optHeadless')) document.getElementById('optHeadless').value = savedHeadless;
    // Wait for RF to finish before next bloc
    await new Promise(resolve => {
      // Initial delay to let RF start
      setTimeout(() => {
        const check = setInterval(async () => {
          if (window._suiteStopped) { clearInterval(check); resolve(); return; }
          try {
            const r = await fetch('/api/rf/status');
            const d = await r.json();
            if (d.status === 'idle') { clearInterval(check); resolve(); }
          } catch(e) { clearInterval(check); resolve(); }
        }, 2000);
      }, 3000); // wait 3s before first poll
    });
    await new Promise(r => setTimeout(r, 1000));
  }
  // Update progress to done
  const finalLbl = suiteProgressDiv.querySelector('#suite-progress-label');
  if (finalLbl) finalLbl.textContent = window._suiteStopped
    ? t('suiterun.progressManualStop').replace('{title}', suite.title)
    : t('suiterun.progressDone').replace('{title}', suite.title).replace(/\{n\}/g, tests.length);

  // Consolidated report will be rendered by result handler when all blocs complete
  // Fallback: render now if not already rendered
  if ((window._suiteBloc_reports||[]).length > 0 && (window._suiteBloc_reports||[]).length >= tests.length) {
    renderConsolidatedSuiteReport_inline();
  }

  } catch(e) { console.error('Suite error:', e); }
  finally {
    window._suiteRunning = false;
    window._currentSuiteTitle = null;
  }

  // ── Consolidated suite report ─────────────────────────────────────────────
  // Collect suite bloc reports saved during this run
  const suiteReports = (window._suiteBloc_reports || []);
  window._suiteBloc_reports = []; // reset for next suite run

  // Remettre bouton run, cacher stop
  const _runBtnEnd  = document.getElementById('runBtn-' + suite.id);
  const _stopBtnEnd = document.getElementById('stopBtn-' + suite.id);
  if (_runBtnEnd)  _runBtnEnd.style.display  = 'inline-flex';
  if (_stopBtnEnd) _stopBtnEnd.style.display = 'none';
  showToast((tests.length>1?t('suiterun.suiteFinishedMany'):t('suiterun.suiteFinishedOne')).replace('{title}', suite.title).replace('{n}', tests.length));
}


async function runCheckedSuiteGroups() {
  if (window._suiteBatchRunning || window._suiteRunning) { showToast(t('suiterun.suiteAlreadyRunning2')); return; }
  // dedup : un meme suiteId ne doit etre lance qu'une fois par clic
  const ids = [...new Set([...document.querySelectorAll('.suite-group-cb:checked')].map(cb => cb.dataset.suiteId))];
  if (ids.length === 0) { showToast(t('suiterun.checkOneSuite')); return; }
  window._suiteBatchRunning = true;
  try {
    for (const id of ids) {
      const suite = savedSuites.find(s => s.id === id);
      if (suite) await runSuiteGroup(savedSuites.indexOf(suite));
    }
  } finally {
    window._suiteBatchRunning = false;
  }
}


// ── Toggle suite test enabled/disabled ───────────────────────────────────────
function toggleSuiteTest(suiteIdx, tid) {
  const t = suiteRegistry.find(r => r.id === tid);
  if (!t) return;
  t.enabled = t.enabled === false ? true : false;
  saveSuiteRegistry();
  renderSavedSuites();
  showToast(t.enabled ? window.t('suiterun.enabled') : window.t('suiterun.disabled'));
}



function suiteMoveUp(si, ti) {
  if (ti === 0) return;
  // si peut être un index numérique ou un suiteId string
  const realIdx = typeof si === 'string'
    ? savedSuites.findIndex(s => s.id === si)
    : si;
  const suite = savedSuites[realIdx];
  if (!suite) return;
  const ids = savedSuites[realIdx]?.testIds;
  if (!ids) return;
  [ids[ti-1], ids[ti]] = [ids[ti], ids[ti-1]];
  savedSuites[realIdx].updatedAt = new Date().toISOString();
  saveSuitesList(); saveSuiteRegistry(); renderSavedSuites();
}
function suiteMoveDown(si, ti) {
  const realIdx = typeof si === 'string'
    ? savedSuites.findIndex(s => s.id === si)
    : si;
  const suite = savedSuites[realIdx];
  if (!suite) return;
  const ids = savedSuites[realIdx]?.testIds;
  if (!ids || ti >= ids.length - 1) return;
  [ids[ti], ids[ti+1]] = [ids[ti+1], ids[ti]];
  // renumberSuiteTests supprimé — garde les IDs stables
  savedSuites[realIdx].updatedAt = new Date().toISOString();
  saveSuitesList(); saveSuiteRegistry(); renderSavedSuites();
}

function renumberSuiteTests(si) {
  const ids = savedSuites[si]?.testIds;
  if (!ids) return;
  ids.forEach((id, i) => {
    const t = suiteRegistry.find(r => r.id === id);
    if (t) {
      const newId = 'T' + String(i + 1).padStart(3, '0');
      t.id = newId;
      ids[i] = newId;
    }
  });
}

function suiteDropReorder(toSi, toTi) {
  const fromSi = window._dsi;
  const fromTi = window._dti;
  if (fromSi === undefined || fromTi === undefined) return;
  if (fromSi !== toSi || fromTi === toTi) return;
  const ids = savedSuites[fromSi]?.testIds;
  if (!ids) return;

  // Reorder testIds
  const [moved] = ids.splice(fromTi, 1);
  ids.splice(toTi, 0, moved);

  // Renumber suiteRegistry IDs to match new order
  ids.forEach((id, i) => {
    const t = suiteRegistry.find(r => r.id === id);
    if (t) {
      const newId = 'T' + String(i + 1).padStart(3, '0');
      // Update id in suiteRegistry
      const oldId = t.id;
      t.id = newId;
      // Update reference in testIds
      ids[i] = newId;
      console.log('Reordered:', oldId, '->', newId);
    }
  });

  savedSuites[fromSi].testIds = ids;
  savedSuites[fromSi].updatedAt = new Date().toISOString();
  saveSuitesList();
  saveSuiteRegistry();
  renderSavedSuites();
  window._dsi = undefined;
  window._dti = undefined;
  showToast(t('suiterun.orderUpdated'));
}

// ── Drag & drop to reorder tests within a suite ───────────────────────────────
let _dragSuiteIdx = null;
let _dragTestIdx  = null;

function onTestDragStart(e, suiteIdx, testIdx) {
  _dragSuiteIdx = suiteIdx;
  _dragTestIdx  = testIdx;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.style.opacity = '0.5';
}

function onTestDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.style.background = 'rgba(0,212,170,0.08)';
}

function onTestDragLeave(e) {
  e.currentTarget.style.background = '';
}

function onTestDrop(e, suiteIdx, testIdx) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.style.background = '';
  if (_dragSuiteIdx === null || _dragTestIdx === testIdx) return;

  if (_dragSuiteIdx === suiteIdx) {
    // Reorder within same suite
    const ids   = savedSuites[suiteIdx].testIds;
    const [moved] = ids.splice(_dragTestIdx, 1);
    ids.splice(testIdx, 0, moved);
    savedSuites[suiteIdx].updatedAt = new Date().toISOString();
    saveSuitesList();
    renderSavedSuites();
  }
  _dragSuiteIdx = null;
  _dragTestIdx  = null;
}

// Drop from chat card into suite group
function onSuiteDragOver(e, suiteIdx) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  e.currentTarget.style.borderColor = 'var(--teal)';
}

function onSuiteDragLeave(e) {
  e.currentTarget.style.borderColor = 'var(--border)';
}

function onSuiteDrop(e, suiteIdx) {
  e.preventDefault();
  e.currentTarget.style.borderColor = 'var(--border)';
  if (_dragTestIdx !== null) return; // internal reorder handled by onTestDrop

  try {
    const raw  = e.dataTransfer.getData('application/x-rf-card');
    if (!raw) return;
    const data = JSON.parse(raw);
    const code = decodeURIComponent(data.code);
    const uniqueFile = (data.filename || 'test_' + Date.now() + '.robot');
    const name = (data.name || uniqueFile.replace('.robot','').replace(/_/g,' ')).replace(/\b\w/g, c => c.toUpperCase());
    const id   = generateSuiteId();
    suiteRegistry.push({ id, name, filename: uniqueFile, code, addedAt: new Date().toISOString(), droppedIntoGroup: true });
    saveSuiteRegistry();
    if (!savedSuites[suiteIdx].testIds.includes(id)) {
      savedSuites[suiteIdx].testIds.push(id);
      savedSuites[suiteIdx].updatedAt = new Date().toISOString();
      saveSuitesList();
    }
    renderSuiteTestList();
    renderSavedSuites();
    showToast(t('suiterun.addedToSuite').replace('{id}', id).replace('{title}', savedSuites[suiteIdx].title));
  } catch(err) {
    showToast(t('suiterun.dropImpossible') + err.message);
  }
}
// ── Suite panel drag resize ───────────────────────────────────────────────────
(function() {
  let dragging = false;
  let startX   = 0;
  let startW   = 0;

  document.addEventListener('mousedown', e => {
    const handle = document.getElementById('suitePanelHandle');
    if (!handle || e.target !== handle) return;
    dragging = true;
    startX   = e.clientX;
    startW   = document.getElementById('suitePanel').offsetWidth;
    document.body.style.userSelect  = 'none';
    document.body.style.cursor      = 'ew-resize';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const panel  = document.getElementById('suitePanel');
    if (!panel)  return;
    const dx     = startX - e.clientX; // dragging left = wider
    const newW   = Math.min(Math.max(startW + dx, 260), window.innerWidth * 0.8);
    panel.style.width = newW + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor     = '';
  });
})();
