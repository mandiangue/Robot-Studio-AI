// ============================================================================
// suites.js — gestion des suites : registre, scheduler, panneau suite,
//             suites sauvegardées. Extrait de qa-agent.js.
// ============================================================================

// Suite registry — { id, name, filename, code }
let suiteRegistry  = [];
let suiteSchedules = []; // { id, suiteName, tests[], type, datetime, interval, unit, active, nextRun }
let scheduleTimers = {};

// i18n helpers — la VALUE d'unité reste FR (clé msMap/schedule.unit) ; seul le LABEL est traduit.
function _suiteUnitLabel(u){ return u==='minutes'?t('suites.unitMinutes'):u==='jours'?t('suites.unitDays'):t('suites.unitHours'); }
function _suiteLoc(){ return currentLang==='en'?'en-GB':'fr-FR'; }

// Bascule de langue : re-render du panneau suites s'il est ouvert (titres sauvés à chaque frappe -> rebuild sûr).
// Le modal scheduler est recréé au clic (t() au build) -> pas de re-render ici.
window.__i18nRerender = window.__i18nRerender || [];
window.__i18nRerender.push(function(){
  var p=document.getElementById('suitePanel');
  if(p && p.style.display==='flex' && typeof renderSavedSuites==='function') renderSavedSuites();
});

// ── Register a test when code is generated ────────────────────────────────────
function generateSuiteId() {
  // Find next available T-number
  const used = new Set(suiteRegistry.map(t => t.id));
  let n = suiteRegistry.length + 1;
  while (used.has('T' + String(n).padStart(3,'0'))) n++;
  return 'T' + String(n).padStart(3,'0');
}

function registerSuiteTest(filename, code) {
  const id = generateSuiteId();
  // Generate readable name from filename
  const rawName = filename.replace('.robot','').replace(/^test_|^suite_/,'').replace(/_/g,' ').trim();
  const name = rawName.replace(/\b\w/g, c => c.toUpperCase()) || 'Test ' + id;

  // If same filename exists, create a new entry with incremented name instead of updating
  const sameFile = suiteRegistry.filter(t => t.filename === filename);
  if (sameFile.length > 0) {
    // Add as new entry with version suffix
    const newName = name + ' v' + (sameFile.length + 1);
    const newFilename = filename.replace('.robot', '_v' + (sameFile.length + 1) + '.robot');
    suiteRegistry.push({ id, name: newName, filename: newFilename, code, addedAt: new Date().toISOString() });
  } else {
    suiteRegistry.push({ id, name, filename, code, addedAt: new Date().toISOString() });
  }

  saveSuiteRegistry();
  renderSuiteTestList();
  showToast(t('suites.addedToSuite').replace('{id}', id));
}

function saveSuiteRegistry() {
  // Sauvegarde aussi dans MongoDB via saveSuitesList
  fetch('/api/storage/suites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ savedSuites, registry: suiteRegistry }),
  }).catch(e => console.warn('MongoDB registry error:', e.message));
  try {
    // Save registry with pomCode for offline use
    const light = suiteRegistry.map(t => ({
      id: t.id, name: t.name, filename: t.filename,
      addedAt: t.addedAt, cardId: t.cardId, baseUrl: t.baseUrl,
      enabled: t.enabled, droppedIntoGroup: t.droppedIntoGroup, code: t.code
    }));
    localStorage.setItem('qa_suite_registry', JSON.stringify(light));
    // Save codes separately
    const codes = {};
    suiteRegistry.forEach(t => {
      if (t.code) codes[t.id + '_code'] = t.code;
      if (t.pomCode) codes[t.id + '_pom'] = t.pomCode;
    });
    // Save pomCode separately per bloc to avoid quota
    suiteRegistry.forEach(t => {
      if (t.pomCode) {
        try { localStorage.setItem('qa_pom_' + t.id, t.pomCode); } catch(e) {}
      }
      if (t.code) {
        try { localStorage.setItem('qa_code_' + t.id, t.code); } catch(e) {}
      }
    });
    try { localStorage.setItem('qa_suite_codes', JSON.stringify(codes)); } catch(e) {}
  } catch(e) { console.warn('Suite save error:', e); }
}

function loadSuiteRegistry() {
  try {
    const s = localStorage.getItem('qa_suite_registry');
    if (s) suiteRegistry = JSON.parse(s);
    // Restore codes
    const codes = JSON.parse(localStorage.getItem('qa_suite_codes') || '{}');
    suiteRegistry.forEach(t => {
      if (!t.code) t.code = localStorage.getItem('qa_code_' + t.id) || codes[t.id + '_code'] || codes[t.id] || '';
      if (!t.pomCode) t.pomCode = localStorage.getItem('qa_pom_' + t.id) || codes[t.id + '_pom'] || '';
    });
    const sc = localStorage.getItem('qa_suite_schedules');
    if (sc) suiteSchedules = JSON.parse(sc);
  } catch(e) { console.warn('Suite load error:', e); }
}

function renderSuiteTestList() {}
function toggleSuiteItem(el) {
  const cb = el.querySelector('input[type="checkbox"]');
  if (cb) { cb.checked = !cb.checked; el.classList.toggle('selected', cb.checked); }
}

function toggleSuiteCheck(cb, tid) {
  cb.closest('.suite-test-item').classList.toggle('selected', cb.checked);
}


function updateSuiteTestDesc(id, desc) {
  const t = suiteRegistry.find(t => t.id === id);
  if (t) { t.description = desc; saveSuiteRegistry(); }
}

function updateSuiteTestName(id, newName) {
  const t = suiteRegistry.find(t => t.id === id);
  if (t && newName.trim()) {
    t.name = newName.trim();
    saveSuiteRegistry();
  }
}

function removeSuiteTest(id) {
  suiteRegistry = suiteRegistry.filter(t => t.id !== id);
  saveSuiteRegistry();
  renderSuiteTestList();
}

function getSelectedTests() {
  return [...document.querySelectorAll('.suite-test-item input[type="checkbox"]:checked')]
    .map(cb => {
      const tid = cb.closest('.suite-test-item')?.dataset?.tid;
      return suiteRegistry.find(t => t.id === tid);
    }).filter(Boolean);
}

// ── Run selected tests ────────────────────────────────────────────────────────
async function runSuiteSelected() {
  const selected = getSelectedTests();
  if (selected.length === 0) { showToast(t('suites.selectOneTest')); return; }

  const titleEl = document.getElementById('suiteTitleInput') || document.getElementById('suiteNameInput');
  const suiteName = (titleEl?.value || '').trim() || 'Suite sans nom';
  try { localStorage.setItem('qa_suite_title', suiteName); } catch(e) {}
  const combined  = selected.map(t => t.code).join('\n\n');
  const filename  = 'suite_' + suiteName.replace(/\s+/g,'_').toLowerCase();

  showTyping();
  renderAgentMsg((selected.length>1?t('suites.launchingSuiteMany'):t('suites.launchingSuiteOne')).replace('{name}', suiteName).replace('{n}', selected.length));

  await runTestsFromCard(combined, filename + '.robot');
}


function updateSchedBtn() {
  const btn = document.getElementById('schedBtn');
  if (!btn) return;
  const hasChecked = [...document.querySelectorAll('.suite-group-cb:checked')].length > 0;
  btn.style.pointerEvents = hasChecked ? 'auto' : 'none';
  btn.style.background    = hasChecked ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.05)';
  btn.style.borderColor   = hasChecked ? 'rgba(168,85,247,0.3)'  : 'rgba(168,85,247,0.15)';
  btn.style.color         = hasChecked ? '#c084fc' : '#9ca3af';
  btn.style.cursor        = hasChecked ? 'pointer' : 'not-allowed';
  btn.style.opacity       = hasChecked ? '1' : '0.5';
}

// Update scheduler button whenever any suite checkbox changes
document.addEventListener('change', e => {
  if (e.target.classList.contains('suite-group-cb')) updateSchedBtn();
});

// ── Scheduler ─────────────────────────────────────────────────────────────────
function openScheduler() {
  document.getElementById('schedulerModal')?.remove();

  const selected = getSelectedTests();
  const checkedSuiteIds = [...document.querySelectorAll('.suite-group-cb:checked')].map(cb => cb.dataset.suiteId);
  const suiteIds = checkedSuiteIds.length > 0 ? checkedSuiteIds : savedSuites.map(s => s.id).slice(0,1);
  const suiteName = savedSuites.length > 0 ? savedSuites[0].title : 'Suite sans nom';
  try { localStorage.setItem('qa_suite_title', suiteName); } catch(e) {}

  const scheduleRows = suiteSchedules.map((s, i) => `
    <div class="scheduler-slot">
      <span class="sched-badge ${s.active ? 'active' : 'pending'}">${s.active ? t('suites.active') : t('suites.inactive')}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:var(--text);font-weight:600">${escHtml(s.suiteName)}</div>
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace">
          ${s.type === 'once' ? '📅 ' + new Date(s.datetime).toLocaleString(_suiteLoc()) : t('suites.everyInterval').replace('{interval}', s.interval).replace('{unit}', _suiteUnitLabel(s.unit))}
          · ${t('suites.next')} ${s.nextRun ? new Date(s.nextRun).toLocaleString(_suiteLoc()) : '—'}
        </div>
      </div>
      <button onclick="toggleSchedule(${i})"
        style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:4px 8px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
        ${s.active ? t('suites.pause') : t('suites.activate')}
      </button>
      <button onclick="stopTestRun();deleteSchedule(${i})"
        style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);color:var(--red);padding:4px 8px;border-radius:5px;font-size:10px;cursor:pointer" title="${t('suites.stopRunTitle')}">${t('suites.stop')}</button>
      <button onclick="deleteSchedule(${i})"
        style="background:transparent;border:1px solid rgba(230,57,70,0.3);color:var(--red);padding:4px 8px;border-radius:5px;font-size:10px;cursor:pointer" title="${t('suites.deleteTitle')}">✕</button>
    </div>`).join('') || '<div style="padding:16px;text-align:center;color:var(--gray);font-size:12px;font-style:italic">'+t('suites.noScheduling')+'</div>';

  const modal = document.createElement('div');
  modal.id = 'schedulerModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `<style>#schedDatetime::-webkit-calendar-picker-indicator{display:none!important}</style>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:580px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column">

      <!-- Header -->
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">${t('suites.schedulerTitle')}</span>
        <button onclick="document.getElementById('schedulerModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer" title="${t('suites.close')}">✕</button>
      </div>

      <!-- New schedule form -->
      <div style="padding:16px 20px;border-bottom:1px solid var(--border)">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:10px">
          ${t('suites.newScheduling')}
        </div>
        <!-- Suite selector -->
        <div style="margin-bottom:12px">
          <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:6px">${t('suites.suitesToSchedule')}</div>
          <div style="display:flex;flex-direction:column;gap:4px;max-height:120px;overflow-y:auto">
            ${savedSuites.length === 0
              ? '<div style="font-size:12px;color:var(--gray);font-style:italic">'+t('suites.noSuiteFirst')+'</div>'
              : savedSuites.map(s => `<label style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--card);border:1px solid var(--border);border-radius:6px;cursor:pointer">
                  <input type="checkbox" class="sched-suite-cb" value="${s.id}" ${suiteIds.includes(s.id) ? 'checked' : ''} style="accent-color:var(--teal);width:13px;height:13px" />
                  <span style="font-size:12px;color:var(--text);font-weight:600">${escHtml(s.title)}</span>
                  <span style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace">${(s.testIds.length>1?t('suites.testCountMany'):t('suites.testCountOne')).replace('{n}', s.testIds.length)}</span>
                </label>`).join('')
            }
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-bottom:12px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--teal);
                        background:rgba(0,212,170,0.08);border:1px solid var(--teal);padding:6px 14px;border-radius:6px">
            <input type="radio" name="schedType" value="once" checked style="accent-color:var(--teal)"> ${t('suites.once')}
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--gray);
                        background:var(--card);border:1px solid var(--border);padding:6px 14px;border-radius:6px">
            <input type="radio" name="schedType" value="repeat" style="accent-color:var(--teal)"> ${t('suites.repeat')}
          </label>
        </div>

        <div id="schedOnceFields">
          <div style="position:relative;width:100%">
            <input type="text" id="schedDatetime" placeholder="JJ/MM/AAAA HH:MM" readonly
              style="background:var(--surface);border:1px solid var(--teal);border-radius:6px;color:var(--teal);
                     padding:8px 40px 8px 12px;font-size:13px;font-family:'IBM Plex Mono',monospace;outline:none;
                     width:100%;box-sizing:border-box;cursor:pointer" />
            <span onclick="openDatePicker()"
              style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
                     font-size:16px;cursor:pointer;color:var(--teal);z-index:1"
              title="${t('suites.pickDateTitle')}">📅</span>
          </div>
        </div>

        <div id="schedRepeatFields" style="display:none;display:flex;gap:8px;align-items:center">
          <span style="font-size:13px;color:var(--text)">${t('suites.every')}</span>
          <input type="number" id="schedInterval" value="1" min="1"
            style="background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);
                   padding:7px 10px;font-size:13px;font-family:'IBM Plex Mono',monospace;outline:none;width:70px"/>
          <select id="schedUnit"
            style="background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);
                   padding:7px 10px;font-size:13px;font-family:'IBM Plex Mono',monospace;outline:none">
            <option value="minutes">${t('suites.unitMinutes')}</option>
            <option value="heures" selected>${t('suites.unitHours')}</option>
            <option value="jours">${t('suites.unitDays')}</option>
          </select>
        </div>

        <button id="schedSubmitBtn"
          style="margin-top:12px;width:100%;background:linear-gradient(135deg,#a855f7,#7c3aed);border:none;color:#fff;
                 padding:10px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          ${t('suites.scheduleBtn')}
        </button>
      </div>

      <!-- Existing schedules -->
      <div style="overflow-y:auto;padding:0 20px;flex:1">
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;padding:12px 0 6px">
          ${t('suites.activeSchedulings')}
        </div>
        ${scheduleRows}
      </div>

    </div>`;

  document.body.appendChild(modal);

  // Wire submit button
  document.getElementById('schedSubmitBtn').addEventListener('click', () => addSchedule());

  // Wire radio buttons
  modal.querySelectorAll('input[name="schedType"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('schedOnceFields').style.display   = r.value === 'once'   ? 'block' : 'none';
      document.getElementById('schedRepeatFields').style.display = r.value === 'repeat' ? 'flex'  : 'none';
    });
  });

  // Set default datetime to now + 5 min
  const dt = document.getElementById('schedDatetime');
  if (dt && !dt.value) {
    const d = new Date(); d.setMinutes(d.getMinutes() + 5);
    const pad = n => String(n).padStart(2,'0');
    dt.value = pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + 'h' + pad(d.getMinutes());
    dt._isoValue = d.toISOString().slice(0,16);
  }
}

function addSchedule() {
  const type = document.querySelector('input[name="schedType"]:checked')?.value || 'once';

  // Get checked suites from modal
  const checkedCbs   = [...document.querySelectorAll('.sched-suite-cb:checked')];
  const chosenSuites = checkedCbs.map(cb => savedSuites.find(s => s.id === cb.value)).filter(Boolean);
  const allTestIds   = [...new Set(chosenSuites.flatMap(s => s.testIds))];
  const suiteName    = chosenSuites.map(s => s.title).join(' + ') || 'Suite sans nom';
  const tests        = allTestIds.map(id => suiteRegistry.find(t => t.id === id)).filter(Boolean);
  const testIds      = allTestIds;

  if (chosenSuites.length === 0) { showToast(t('suites.checkOneSuite')); return; }
  if (tests.length === 0) { showToast(t('suites.selectedNoTests')); return; }

  let schedule = { id: 'SC' + Date.now(), suiteName, suiteIds: chosenSuites.map(s => s.id), testIds, type, active: true };

  if (type === 'once') {
    const dtInput = document.getElementById('schedDatetime');
    const dt = dtInput?._isoValue || dtInput?.value;
    if (!dt) { showToast(t('suites.pickDateTime')); return; }
    schedule.datetime = new Date(dt).toISOString();
    schedule.nextRun  = schedule.datetime;
  } else {
    const interval = parseInt(document.getElementById('schedInterval')?.value || '1');
    const unit     = document.getElementById('schedUnit')?.value || 'heures';
    const msMap    = { minutes: 60000, heures: 3600000, jours: 86400000 };
    schedule.interval = interval;
    schedule.unit     = unit;
    schedule.ms       = interval * (msMap[unit] || 3600000);
    schedule.nextRun  = new Date(Date.now() + schedule.ms).toISOString();
  }

  suiteSchedules.push(schedule);
  saveSchedules();
  startScheduleTimer(schedule);
  document.getElementById('schedulerModal')?.remove();
  showToast(t('suites.schedulingSet').replace('{name}', suiteName));
  openScheduler(); // refresh
}

function saveSchedules() {
  try { localStorage.setItem('qa_suite_schedules', JSON.stringify(suiteSchedules)); } catch(e) {}
}

function startScheduleTimer(schedule) {
  clearTimeout(scheduleTimers[schedule.id]);
  if (!schedule.active) return;

  const now  = Date.now();
  const next = new Date(schedule.nextRun).getTime();
  // If nextRun is more than 1 minute in the past, skip (stale schedule)
  if (next < now - 60000) {
    if (schedule.type === 'repeat') {
      // Recalculate next run from now
      schedule.nextRun = new Date(now + schedule.ms).toISOString();
      saveSchedules();
    } else {
      schedule.active = false;
      saveSchedules();
      return;
    }
  }
  const delay = Math.max(0, new Date(schedule.nextRun).getTime() - now);

  scheduleTimers[schedule.id] = setTimeout(async () => {
    const s = suiteSchedules.find(sc => sc.id === schedule.id);
    if (!s || !s.active) return;

    // Run each selected suite sequentially
    showToast(t('suites.schedulingTriggered').replace('{name}', s.suiteName));
    const suiteIdsToRun = s.suiteIds || [];
    for (const suiteId of suiteIdsToRun) {
      const idx = savedSuites.findIndex(suite => suite.id === suiteId);
      if (idx >= 0) await runSuiteGroup(idx);
    }

    // If repeat, reschedule
    if (s.type === 'repeat') {
      s.nextRun = new Date(Date.now() + s.ms).toISOString();
      saveSchedules();
      startScheduleTimer(s);
    } else {
      s.active = false;
      saveSchedules();
    }
  }, delay);
}

function toggleSchedule(idx) {
  if (!suiteSchedules[idx]) return;
  suiteSchedules[idx].active = !suiteSchedules[idx].active;
  if (suiteSchedules[idx].active) {
    startScheduleTimer(suiteSchedules[idx]);
  } else {
    clearTimeout(scheduleTimers[suiteSchedules[idx].id]);
  }
  saveSchedules();
  openScheduler();
}

function deleteSchedule(idx) {
  const s = suiteSchedules[idx];
  if (s) clearTimeout(scheduleTimers[s.id]);
  suiteSchedules.splice(idx, 1);
  saveSchedules();
  openScheduler();
}

// ── Auto-register is done inside renderCodeMsg directly (see line 898) ──────────

// ── Init on load ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSuiteRegistry();
  loadSavedSuites();
  loadSuitesFromDB().then(() => {
    // Ne nettoyer que si _codeCards est chargé et non vide
    if ((window._codeCards||[]).filter(c => c.type === 'multi' || c.type === 'single').length > 0) {
      cleanSuiteRegistry();
    }
    renderSuiteTestList();
    renderSavedSuites();
  });
  // Restart active schedules
  suiteSchedules.filter(s => s.active).forEach(startScheduleTimer);
});



// ── Suite Panel ───────────────────────────────────────────────────────────────

// ── Nettoyage du suiteRegistry ───────────────────────────────────────────────
function cleanSuiteRegistry() {
  const validCardIds = new Set((window._codeCards||[]).filter(c => c.type === 'multi' || c.type === 'single').map(c => c.cardId));
  const before = suiteRegistry.length;
  // Garder seulement les entrées dont le cardId existe dans _codeCards
  suiteRegistry = suiteRegistry.filter(t => !t.cardId || validCardIds.has(t.cardId));
  // Dédupliquer par cardId — garder la dernière entrée pour chaque cardId
  const seenCardIds = new Map();
  suiteRegistry.forEach(t => { if (t.cardId) seenCardIds.set(t.cardId, t); });
  // Ne garder que les entrées uniques par cardId
  const cleanedByCard = new Map();
  suiteRegistry.forEach(t => {
    if (!t.cardId) return;
    if (!cleanedByCard.has(t.cardId)) cleanedByCard.set(t.cardId, t);
  });
  suiteRegistry = [...cleanedByCard.values()];
  // Mettre à jour savedSuites pour retirer les testIds orphelins
  const validIds = new Set(suiteRegistry.map(t => t.id));
  savedSuites.forEach(s => {
    s.testIds = (s.testIds||[]).filter(id => validIds.has(id));
  });
  const after = suiteRegistry.length;
  if (before !== after) {
    saveSuiteRegistry();
    saveSuitesList();
    console.log(`[cleanSuiteRegistry] ${before} → ${after} entrées`);
  }
}

function openSuitePanel() {
  const panel = document.getElementById('suitePanel');
  if (!panel) { showToast(t('suites.panelNotFound')); return; }

  // Toggle behaviour
  if (panel.style.display === 'flex') {
    closeSuitePanel();
    return;
  }

  panel.style.display       = 'flex';
  panel.style.flexDirection = 'column';

  const btn = document.querySelector('[onclick="openSuitePanel()"]');
  if (btn) btn.classList.add('active');
  loadSuiteRegistry();
  loadSavedSuites();
  loadSuitesFromDB().then(() => {
    // Ne nettoyer que si _codeCards est chargé et non vide
    if ((window._codeCards||[]).filter(c => c.type === 'multi' || c.type === 'single').length > 0) {
      cleanSuiteRegistry();
    }
    renderSuiteTestList();
    renderSavedSuites();
  });
  try {
    const saved = localStorage.getItem('qa_suite_title');
    const input = document.getElementById('suiteTitleInput');
    if (saved && input) input.value = saved;
  } catch(e) {}
  setupSuiteDropZone();
}

function setupSuiteDropZone() {}

// ── Render available code cards as a list to add to suite ────────────────────
// Detecte le vrai fichier de test d un card (tests/ + *** Test Cases ***), quel que soit son nom
function _findTestFile(files) {
  if (!Array.isArray(files)) return null;
  // priorite : fichier de tests/ avec des Test Cases
  let tf = files.find(f => /(?:^|\/)tests\//.test(f.filename || '') && (f.code || '').includes('*** Test Cases'));
  if (tf) return tf;
  // sinon : n importe quel fichier avec des Test Cases
  tf = files.find(f => (f.code || '').includes('*** Test Cases'));
  if (tf) return tf;
  // fallback historique
  return files.find(f => (f.filename || '').includes('tests.robot')) || files[0] || null;
}
function _isTestFile(f) {
  return /(?:^|\/)tests\//.test(f.filename || '') && (f.code || '').includes('*** Test Cases');
}

function renderAvailableCodeCards() {
  const container = document.getElementById('suiteDropZone');
  if (!container) return;

  const cards = (window._codeCards || []).filter(c => c.type !== 'report' && c.files?.length);

  if (cards.length === 0) {
    container.innerHTML = `<div style="padding:12px;font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;text-align:center">Aucun bloc de code disponible.<br>Génère d'abord du code RF.</div>`;
    return;
  }

  container.innerHTML = `<div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;padding:8px 12px 4px">BLOCS DISPONIBLES — Clic pour ajouter</div>` +
    cards.map((card, i) => {
      const title = card.title || card.files?.[0]?.filename?.replace('.robot','') || 'Bloc ' + (i+1);
      const fileCount = card.files?.length || 0;
      const isAdded = suiteRegistry.some(r => r.cardId === card.cardId);
      const hover = isAdded ? '' : 'onmouseover="this.style.background=\'rgba(0,212,170,0.08)\'" onmouseout="this.style.background=\'transparent\'"';
      const badge = isAdded
        ? '<span style="font-size:10px;color:var(--teal);font-family:\'IBM Plex Mono\',monospace">✅ Ajouté</span>'
        : '<span style="font-size:10px;color:var(--teal);font-family:\'IBM Plex Mono\',monospace">+ Ajouter</span>';
      return `<div onclick="addCardToSuite('${card.cardId}')" ${hover}
        style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:${isAdded?'default':'pointer'};
               background:${isAdded?'rgba(0,212,170,0.05)':'transparent'};
               border-bottom:1px solid var(--border);transition:background .15s">
        <span style="font-size:16px">${isAdded?'✅':'📁'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:700;color:${isAdded?'var(--teal)':'var(--text)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(title)}</div>
          <div style="font-size:10px;color:var(--gray)">${fileCount} fichier(s)</div>
        </div>
        ${badge}
      </div>`;
    }).join('');
}

function addCardToSuite(cardId) {
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card) return;

  // Check not already added
  if (suiteRegistry.some(r => r.cardId === cardId)) {
    showToast(t('suites.alreadyInSuite')); return;
  }

  const title = card.title || card.files?.[0]?.filename?.replace('.robot','') || 'Test';
  const mainFile = _findTestFile(card.files);
  const filename = mainFile?.filename || 'tests.robot';

  // Build self-contained code by merging ALL files from this card
  let code = '';

  // 1. Start with Settings from tests.robot
  const testsCode = mainFile?.code || '';

  // 2. Collect all content from resource files (variables, keywords, pages)
  const allSections = { Settings: '', Variables: '', Keywords: '', TestCases: '' };

  card.files?.forEach(f => {
    const c = f.code || '';
    // Extract *** Variables *** from each file
    const varMatch = c.match(/\*{3}\s*Variables\s*\*{3}[^\n]*\n([\s\S]*?)(?=\*{3}|$)/);
    if (varMatch) allSections.Variables += varMatch[1];
    // Extract *** Keywords *** from each file
    const kwMatch = c.match(/\*{3}\s*Keywords\s*\*{3}[^\n]*\n([\s\S]*?)(?=\*{3}|$)/);
    if (kwMatch) allSections.Keywords += kwMatch[1];
  });

  // 3. Use ALL files from card — server will handle multi-file POM
  // Just use the code as-is with all files concatenated
  // The server's fixSuiteMode and cleanRobotCodeServer will handle the rest
  // Build self-contained code — inline all variables from card files
  // This avoids dependency on shared ../resources/variables.robot
  
  // Extract variables section from all files in this card
  let inlineVars = '';
  let inlineKeywords = '';
  card.files?.forEach(f => {
    const c = f.code || '';
    // Extract *** Variables *** content
    const vm = c.match(/\*{3}\s*Variables[^\n]*\n((?:(?!\*{3})[\s\S])*)/);
    if (vm) inlineVars += vm[1];
    // Extract *** Keywords *** content  
    const km = c.match(/\*{3}\s*Keywords[^\n]*\n((?:(?!\*{3})[\s\S])*)/);
    if (km && !f.filename.includes('tests.robot')) inlineKeywords += km[1];
  });

  // Build self-contained tests.robot with inline variables and keywords
  let selfCode = testsCode
    .replace(/^Resource[^\n]*variables\.robot[^\n]*$/gm, '')
    .replace(/^Resource[^\n]*keywords\.robot[^\n]*$/gm, '');

  // Inject variables inline
  if (inlineVars.trim()) {
    if (selfCode.includes('*** Variables ***')) {
      selfCode = selfCode.replace(/(\*{3}\s*Variables[^\n]*\n)/, '$1' + inlineVars);
    } else {
      selfCode = selfCode.replace(/(\*{3}\s*Settings[^\n]*\n)/, '$1*** Variables ***\n' + inlineVars + '\n');
    }
  }

  // Inject keywords inline
  if (inlineKeywords.trim()) {
    if (selfCode.includes('*** Keywords ***')) {
      selfCode = selfCode.replace(/(\*{3}\s*Keywords[^\n]*\n)/, '$1' + inlineKeywords);
    } else {
      selfCode += '\n*** Keywords ***\n' + inlineKeywords;
    }
  }

  code = selfCode;

  const id = generateSuiteId();

  // Build pomCode from card files for post-reload use
  let pomCode = '';
  const cardObj = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (cardObj?.files?.some(f => f.code?.trim())) {
    const fname = 'suite_PLACEHOLDER_' + id + '.robot';
    const pomLines = cardObj.files
      .filter(f => f.code?.trim() && !_isTestFile(f))
      .map(f => {
        const relPath = f.filename.replace(/^.*rf_tests[/\\]/, '').replace(/\\/g, '/');
        const label = relPath.split('/').pop().replace('.robot','');
        return '***** FILE: ' + relPath + ' | ' + label + ' | suite bloc | ' + title + '\n' + f.code;
      });
    pomLines.push('***** FILE: tests/' + fname + ' | tests | suite bloc | ' + title + '\n' + code);
    pomCode = pomLines.join('\n\n');
  }

  suiteRegistry.push({
    id, cardId,
    name: title,
    filename: filename.split('/').pop(),
    code, pomCode,
    addedAt: new Date().toISOString(),
    droppedIntoGroup: true
  });
  saveSuiteRegistry();
  renderSuiteTestList();
  renderAvailableCodeCards(); // refresh to show ✅
  showToast(t('suites.addedToSuiteTitle').replace('{title}', title));
}

function closeSuitePanel() {
  const panel = document.getElementById('suitePanel');
  if (panel) panel.style.display = 'none';
  const btn2 = document.querySelector('[onclick="openSuitePanel()"]');
  if (btn2) btn2.classList.remove('active');
}

// ══════════════════════════════════════════════════════════════════════════════
// NAMED SUITES — save/load complete suites
// ══════════════════════════════════════════════════════════════════════════════
let savedSuites = [];

function loadSavedSuites() {
  try { const s = localStorage.getItem('qa_named_suites'); if (s) savedSuites = JSON.parse(s); } catch(e) {}
}
async function loadSuitesFromDB() {
  try {
    const r = await fetch('/api/storage/suites');
    const d = await r.json();
    if (d.ok) {
      if (d.savedSuites?.length > 0) savedSuites = d.savedSuites;
      if (d.registry?.length > 0) suiteRegistry = d.registry;
    }
  } catch(e) { console.warn('loadSuitesFromDB error:', e.message); }
}

function saveSuitesList() {
  try { localStorage.setItem('qa_named_suites', JSON.stringify(savedSuites)); } catch(e) {}
  fetch('/api/storage/suites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ savedSuites, registry: suiteRegistry }),
  }).catch(e => console.warn('MongoDB suites error:', e.message));
}

function saveCurrentSuite() {
  const titleEl = document.getElementById('suiteTitleInput');
  const title   = (titleEl && titleEl.value || '').trim() || 'Suite ' + new Date().toLocaleDateString('fr-FR');
  const checked = document.querySelectorAll('.suite-test-item input[type="checkbox"]:checked');
  const testIds = [...checked].map(cb => cb.closest('.suite-test-item') && cb.closest('.suite-test-item').dataset.tid).filter(Boolean);
  if (testIds.length === 0) { showToast(t('suites.checkOneTestList')); return; }

  const existing = savedSuites.findIndex(s => s.title === title);
  const suite = {
    id:        existing >= 0 ? savedSuites[existing].id : 'S' + Date.now(),
    title, testIds,
    createdAt: existing >= 0 ? savedSuites[existing].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (existing >= 0) savedSuites[existing] = suite; else savedSuites.push(suite);
  saveSuitesList();
  renderSavedSuites();
  showToast((testIds.length>1?t('suites.suiteSavedMany'):t('suites.suiteSavedOne')).replace('{title}', title).replace('{n}', testIds.length));
}

function loadNamedSuite(suiteId) {
  const suite = savedSuites.find(s => s.id === suiteId);
  if (!suite) return;
  const titleEl = document.getElementById('suiteTitleInput');
  if (titleEl) { titleEl.value = suite.title; try { localStorage.setItem('qa_suite_title', suite.title); } catch(e) {} }
  document.querySelectorAll('.suite-test-item').forEach(el => {
    const tid = el.dataset.tid;
    const cb  = el.querySelector('input[type="checkbox"]');
    const sel = suite.testIds.includes(tid);
    if (cb) cb.checked = sel;
    el.classList.toggle('selected', sel);
  });
  showToast(t('suites.suiteLoaded').replace('{title}', suite.title));
}

function deleteNamedSuite(suiteId) {
  savedSuites = savedSuites.filter(s => s.id !== suiteId);
  saveSuitesList();
  renderSavedSuites();
  showToast(t('suites.suiteDeleted'));
}

function renderSavedSuites() {
  const el = document.getElementById('savedSuitesList');
  if (!el) return;

  let html = '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">';
  html += '<button onclick="addNewSuiteGroup()" style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);padding:7px 14px;border-radius:6px;font-size:11px;font-family:monospace;cursor:pointer;font-weight:600">'+t('suites.newSuite')+'</button>';
  html += '<button onclick="runCheckedSuiteGroups()" style="background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#07090f;padding:7px 14px;border-radius:6px;font-size:11px;font-family:monospace;cursor:pointer;font-weight:700">'+t('suites.runSuite')+'</button>';
  html += '</div>';

  if (savedSuites.length === 0) {
    html += '<div style="font-size:11px;color:var(--gray);font-style:italic;padding:8px 4px;text-align:center">'+t('suites.noSuite')+'</div>';
    el.innerHTML = html;
    return;
  }

  html += savedSuites.map((s, si) => {
    // Tests in this suite
    const suiteTests = (s.testIds || [])
      .map(id => suiteRegistry.find(t => t.id === id))
      .filter(Boolean);

    const testsHtml = suiteTests.map((t, ti) => {
      // Get code preview (first 3 lines of code)
      const codeLines = (t.code||'').split('\n').filter(l => l.trim()).slice(0,5);
      const codePreview = codeLines.map(l => '<div style="font-size:10px;font-family:IBM Plex Mono,monospace;color:#7dd3c8;padding:1px 0">' + escHtml(l) + '</div>').join('');
      const expandId = 'suite-expand-' + si + '-' + ti;
      const isEnabled = t.enabled !== false;
      return `<div class="suite-group-test"
        style="border-bottom:1px solid var(--border);opacity:${isEnabled?'1':'0.5'}">
        <div style="display:flex;align-items:center;gap:8px;padding:7px 10px 7px 20px;cursor:default">
          <span style="color:var(--gray);cursor:grab;font-size:14px;flex-shrink:0" title="${t('suites.reorder')}">⠿</span>
          <span style="background:rgba(0,212,170,0.1);color:var(--teal);font-family:'IBM Plex Mono',monospace;
                       font-size:9px;padding:1px 6px;border-radius:3px;border:1px solid rgba(0,212,170,0.2);white-space:nowrap">${escHtml(t.id)}</span>
          <span style="flex:1;font-size:12px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(t.name)}</span>

          <div style="display:flex;flex-direction:column;gap:1px">
            <button onclick="event.stopPropagation();suiteMoveUp('${s.id}',${ti})"
              style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.2);color:var(--teal);
                     cursor:pointer;font-size:9px;padding:1px 5px;border-radius:3px;line-height:1"
              title="Monter">▲</button>
            <button onclick="event.stopPropagation();suiteMoveDown('${s.id}',${ti})"
              style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.2);color:var(--teal);
                     cursor:pointer;font-size:9px;padding:1px 5px;border-radius:3px;line-height:1"
              title="Descendre">▼</button>
          </div>
          <button onclick="event.stopPropagation();toggleSuiteTest(${si},'${t.id}')"
            style="background:transparent;border:none;cursor:pointer;font-size:12px;padding:1px 3px"
            title="${isEnabled?t('suites.disable'):t('suites.enable')}">${isEnabled?'✅':'⬜'}</button>
          <button onclick="removeTestFromSuite(${si},'${t.id}')"
            style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:11px;padding:1px 4px"
            onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray)'" title="${t('suites.remove')}">✕</button>
        </div>
        <div id="${expandId}" style="display:none;padding:6px 10px 8px 36px;background:rgba(0,0,0,0.2);border-top:1px solid var(--border)">
          ${codePreview || '<div style="font-size:10px;color:var(--gray);font-style:italic">'+t('suites.noCode')+'</div>'}
        </div>
      </div>`;
    }).join('');

    const addableTests = suiteRegistry.filter(t => !(s.testIds||[]).includes(t.id));
    const addOptions   = addableTests.map(t =>
      `<option value="${t.id}">${t.id} — ${escHtml(t.name)}</option>`
    ).join('');

    return `
      <div class="suite-group" data-suite-idx="${si}"
        ondragover="onSuiteDragOver(event,${si})" ondrop="onSuiteDrop(event,${si})" ondragleave="onSuiteDragLeave(event)"
        style="background:var(--card);border:1px solid var(--border);border-radius:10px;margin-bottom:10px;overflow:hidden;transition:border-color .2s">

        <!-- Suite header -->
        <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(0,212,170,0.04);border-bottom:1px solid var(--border)">
          <input type="checkbox" class="suite-group-cb" data-suite-id="${s.id}"
            style="accent-color:var(--teal);width:14px;height:14px;flex-shrink:0;cursor:pointer"
            onclick="event.stopPropagation()" onchange="updateSchedBtn()" />
          <span style="font-size:13px;flex-shrink:0">📁</span>
          <input type="text" value="${escHtml(s.title)}"
            onclick="event.stopPropagation()"
            oninput="updateSuiteGroupTitle(${si}, this.value)"
            style="flex:1;background:transparent;border:none;border-bottom:1px solid transparent;
                   color:var(--text);font-size:13px;font-weight:700;font-family:'Syne',sans-serif;
                   outline:none;padding:2px 4px;min-width:0"
            onfocus="this.style.borderBottomColor='var(--teal)'"
            onblur="this.style.borderBottomColor='transparent'" />
          <span style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;white-space:nowrap">
            ${(suiteTests.length>1?t('suites.testCountMany'):t('suites.testCountOne')).replace('{n}', suiteTests.length)}
          </span>
          <button onclick="runSuiteGroup(${si})" id="runBtn-${s.id}"
            title="${t('suites.runSuiteTitle')}"
            style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:#22c55e;
                   padding:4px 10px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">▶️</button>
          <button onclick="stopSuiteGroup('${s.id}')" id="stopBtn-${s.id}"
            title="${t('suites.stopSuiteTitle')}"
            style="display:none;background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.3);color:var(--red);
                   padding:4px 10px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">⏹</button>
          <select onchange="setSuiteHeadless('${s.id}',this.value)" onclick="event.stopPropagation()"
            style="font-size:10px;background:var(--card);border:1px solid var(--border);color:var(--gray);border-radius:4px;padding:2px 4px;cursor:pointer"
            title="${t('suites.browserModeTitle')}">
            <option value="visible" ${(s.headless||'visible')==='visible'?'selected':''}>🖥️</option>
            <option value="headless" ${s.headless==='headless'?'selected':''}>🔇 Headless</option>
          </select>
          <button onclick="deleteSuiteGroup(${si})"
            style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:12px;padding:2px 4px;border-radius:3px"
            onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray)'"
            title="${t('suites.deleteSuiteTitle')}">✕</button>
        </div>

        <!-- Tests list -->
        ${testsHtml || '<div id="dropZone-'+s.id+'" style="padding:14px 20px;font-size:11px;color:var(--gray);font-style:italic;border:2px dashed var(--border);border-radius:8px;margin:8px;text-align:center;transition:all .2s" ondragover="event.preventDefault();this.style.borderColor=\'var(--teal)\';this.style.background=\'rgba(0,212,170,0.05)\'" ondragleave="this.style.borderColor=\'var(--border)\';this.style.background=\'\'" ondrop="dropCardToSuite(event,\''+s.id+'\')">'+t('suites.dropZone')+'</div>'}

        <!-- Add test to suite -->
        ${addOptions ? `<div style="display:flex;gap:6px;padding:8px 12px;border-top:1px solid var(--border);background:rgba(0,0,0,0.1)">
          <select id="addTestSelect_${si}" onclick="event.stopPropagation()"
            style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);
                   padding:5px 8px;font-size:11px;font-family:'IBM Plex Mono',monospace;outline:none">
            <option value="">${t('suites.selectTest')}</option>
            ${addOptions}
          </select>
          <button onclick="addTestToSuite(${si})"
            style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.3);color:var(--teal);
                   padding:5px 12px;border-radius:6px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
            ${t('suites.addBtn')}
          </button>
        </div>` : '<div style="padding:6px 12px;font-size:10px;color:var(--gray);font-style:italic;border-top:1px solid var(--border)">'+t('suites.allTestsIn')+'</div>'}

      </div>`;
  }).join('');

  el.innerHTML = html;
}
function setSuiteHeadless(suiteId, val) {
  const s = savedSuites.find(x => x.id === suiteId);
  if (s) { s.headless = val; saveSuitesList(); }
}

function openDatePicker() {
  const input = document.getElementById('schedDatetime');
  // Create a hidden native datetime input to get the value
  let hidden = document.getElementById('_schedHidden');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'datetime-local';
    hidden.id = '_schedHidden';
    hidden.style.cssText = 'position:fixed;opacity:0;pointer-events:none;z-index:-1;top:0;left:0';
    const updateFromHidden = () => {
      if (hidden.value) {
        const d = new Date(hidden.value);
        const pad = n => String(n).padStart(2,'0');
        input.value = pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + 'h' + pad(d.getMinutes());
        input._isoValue = hidden.value;
      }
    };
    hidden.onchange = updateFromHidden;
    hidden.oninput  = updateFromHidden;
    hidden.onblur   = updateFromHidden;
    document.body.appendChild(hidden);
  }
  hidden.showPicker();
}
