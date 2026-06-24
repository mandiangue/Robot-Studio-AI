// ============================================================================
// analysis.js — panneau Analyse (filtres + diff) : openAnalysisPanel, _ap*,
//               getAllTestResults, render{Analysis,Filter,Diff}Tab.
// ============================================================================

// ══════════════════════════════════════════════════════════════════════════════
// PANEL ANALYSE — Filtres + Diff côte à côte
// ══════════════════════════════════════════════════════════════════════════════
function _apFilter(s) { const c=document.getElementById('analysisPanelContent'); if(c){c._filters={...(c._filters||{}),status:s};renderAnalysisPanel();} }
function _apSearch(v) { const c=document.getElementById('analysisPanelContent'); if(c){c._filters={...(c._filters||{}),search:v};_apRenderList(c);} }
function _apPage(p)   { const c=document.getElementById('analysisPanelContent'); if(c){c._filters={...(c._filters||{}),page:p};_apRenderList(c);} }
let _analysisPanelOpen = false;

// Bascule de langue : reconstruit le contenu du panneau SEULEMENT s'il est ouvert.
// Le chrome persistant (header/tabs data-i18n) est déjà couvert par applyI18n(document).
// État (_filters/_diffSel/dataset.tab) préservé sur l'élément content -> rebuild sûr.
window.__i18nRerender = window.__i18nRerender || [];
window.__i18nRerender.push(() => {
  const ov = document.getElementById('analysisPanelOverlay');
  if (ov && ov.style.display !== 'none') renderAnalysisPanel();
});

function openAnalysisPanel() {
  let overlay = document.getElementById('analysisPanelOverlay');
  if (overlay) {
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
    _analysisPanelOpen = overlay.style.display !== 'none';
    if (_analysisPanelOpen) renderAnalysisPanel();
    return;
  }

  _analysisPanelOpen = true;

  overlay = document.createElement('div');
  overlay.id = 'analysisPanelOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:800;display:flex;justify-content:flex-end;pointer-events:none';

  const panel = document.createElement('div');
  panel.style.cssText = 'width:680px;min-width:400px;max-width:95vw;height:100vh;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;pointer-events:all;box-shadow:-4px 0 24px rgba(0,0,0,0.4);position:relative;';

  // Resize handle
  const handle = document.createElement('div');
  handle.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:5px;cursor:ew-resize;z-index:10';
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX = e.clientX, startW = panel.offsetWidth;
    const onMove = mv => { panel.style.width = Math.min(Math.max(startW + (startX - mv.clientX), 400), window.innerWidth * 0.95) + 'px'; };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--card);border-bottom:1px solid var(--border);flex-shrink:0';
  header.innerHTML = `
    <span data-i18n="analysis.title" style="font-size:12px;font-weight:700;color:var(--teal);letter-spacing:1px">🔍 ANALYSE</span>
    <button onclick="document.getElementById('analysisPanelOverlay').style.display='none';_analysisPanelOpen=false;"
      style="background:transparent;border:none;color:var(--gray);font-size:16px;cursor:pointer;margin-left:auto">✕</button>
  `;

  // Tabs
  const tabs = document.createElement('div');
  tabs.style.cssText = 'display:flex;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--card)';
  tabs.innerHTML = `
    <button id="aTabFilter" onclick="switchAnalysisTab('filter')" data-i18n="analysis.tabFilters"
      style="flex:1;padding:10px;font-size:13px;font-family:monospace;cursor:pointer;border:none;border-bottom:2px solid var(--teal);background:transparent;color:var(--teal)">
      🔎 FILTRES
    </button>
    <button id="aTabDiff" onclick="switchAnalysisTab('diff')" data-i18n="analysis.tabCompare"
      style="flex:1;padding:10px;font-size:13px;font-family:monospace;cursor:pointer;border:none;border-bottom:2px solid transparent;background:transparent;color:var(--gray)">
      ⚖️ COMPARAISON
    </button>
  `;

  const content = document.createElement('div');
  content.id = 'analysisPanelContent';
  content.style.cssText = 'flex:1;overflow-y:auto;display:flex;flex-direction:column;';

  panel.appendChild(handle);
  panel.appendChild(header);
  panel.appendChild(tabs);
  panel.appendChild(content);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.style.display='none'; _analysisPanelOpen=false; } });

  // Chrome persistant (header/tabs) à la langue courante dès l'ouverture
  if (window.applyI18n) applyI18n(panel);
  renderAnalysisPanel();
}

function switchAnalysisTab(tab) {
  const filterBtn = document.getElementById('aTabFilter');
  const diffBtn   = document.getElementById('aTabDiff');
  if (!filterBtn || !diffBtn) return;
  if (tab === 'filter') {
    filterBtn.style.borderBottomColor = 'var(--teal)'; filterBtn.style.color = 'var(--teal)';
    diffBtn.style.borderBottomColor   = 'transparent';  diffBtn.style.color   = 'var(--gray)';
  } else {
    diffBtn.style.borderBottomColor   = 'var(--teal)'; diffBtn.style.color   = 'var(--teal)';
    filterBtn.style.borderBottomColor = 'transparent';  filterBtn.style.color = 'var(--gray)';
  }
  document.getElementById('analysisPanelContent').dataset.tab = tab;
  renderAnalysisPanel();
}

function getAllTestResults() {
  const results = [];
  (window._codeCards||[]).forEach(card => {
    if (card.type === 'report' && card.data) {
      const run = card.data;
      (run.tests||[]).forEach(t => {
        results.push({
          runId:    run.runNumber || card.cardId,
          date:     run.runDate || '',
          suite:    run.suiteTitle || run.pageTitle || run.suiteName || '',
          name:     t.name,
          status:   (t.status||'').toLowerCase(),
          duration: t.duration || 0,
          message:  t.message || '',
          steps:    t.steps || [],
        });
      });
    }
    if (card.type === 'suite-report' && card.data) {
      const suite = card.data;
      (suite.tests||[]).forEach(t => {
        results.push({
          runId:    suite.runNumber || card.cardId,
          date:     suite.runDate || '',
          suite:    suite.suiteTitle || card.suiteTitle || '',
          name:     t.name,
          status:   (t.status||'').toLowerCase(),
          duration: t.duration || 0,
          message:  t.message || '',
          steps:    t.steps || [],
        });
      });
    }
  });
  return results;
}

function getUniqueRuns() {
  const runs = new Map();
  (window._codeCards||[]).forEach(card => {
    if ((card.type === 'report' || card.type === 'suite-report') && card.data) {
      const d = card.data;
      const id = d.runNumber || card.cardId;
      if (!runs.has(id)) runs.set(id, { id, date: d.runDate || '', suite: d.suiteTitle || card.suiteTitle || '', title: d.pageTitle || card.title || d.suiteName || '', tests: d.tests || [], cardId: card.cardId });
    }
  });
  return [...runs.values()].sort((a,b) => (b.id||0) - (a.id||0));
}

function _apRenderList(content) {
  if (!content) return;
  const filters = content._filters || { status: 'all', search: '', page: 'all' };
  const all = getAllTestResults();

  const filtered = all.filter(t => {
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    if (filters.search && !t.name.toLowerCase().includes(filters.search.toLowerCase()) && !(t.suite||'').toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.page && filters.page !== 'all' && t.suite !== filters.page) return false;
    return true;
  });

  // Grouper par page (suite)
  const grouped = new Map();
  filtered.forEach(t => {
    const key = t.suite || (t.runId ? 'Run #' + t.runId : '—');
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(t);
  });

  let html = `<div style="padding:6px 14px;font-size:12px;color:var(--gray);letter-spacing:1px;border-bottom:1px solid var(--border)">${(filtered.length>1?t('analysis.resultCountMany'):t('analysis.resultCountOne')).replace('{n}', filtered.length)}</div>`;

  if (filtered.length === 0) {
    html += `<div style="padding:32px;text-align:center;font-size:12px;color:var(--gray)">${t('analysis.noResult')}</div>`;
  } else {
    grouped.forEach((tests, pageName) => {
      const passCount = tests.filter(t=>t.status==='pass').length;
      const failCount = tests.filter(t=>t.status==='fail').length;
      const skipCount = tests.filter(t=>t.status==='skip').length;
      const collapseId = 'apGroup_' + btoa(unescape(encodeURIComponent(pageName))).replace(/[^a-zA-Z0-9]/g,'');
      html += `
        <div style="border-bottom:1px solid var(--border)">
          <div onclick="document.getElementById('${collapseId}').style.display=document.getElementById('${collapseId}').style.display==='none'?'block':'none';this.querySelector('.apArrow').textContent=document.getElementById('${collapseId}').style.display==='none'?'▶':'▼'"
            style="display:flex;align-items:center;gap:8px;padding:9px 14px;cursor:pointer;background:var(--card);user-select:none">
            <span class="apArrow" style="font-size:10px;color:var(--gray)">▼</span>
            <span style="font-size:12px;font-weight:700;color:#c084fc;flex:1">📁 ${escHtml(pageName)}</span>
            <span style="font-size:12px;color:#22c55e">✓${passCount}</span>
            <span style="font-size:12px;color:#DC2626;margin-left:4px">✗${failCount}</span>
            ${skipCount?`<span style="font-size:12px;color:#f59e0b;margin-left:4px">⏭${skipCount}</span>`:''}
            <span style="font-size:11px;color:var(--gray);margin-left:6px">${t('analysis.tcCount').replace('{n}', tests.length)}</span>
          </div>
          <div id="${collapseId}">`;

      tests.forEach(t => {
        const sc  = t.status==='pass'?'#22c55e':t.status==='fail'?'#DC2626':'#f59e0b';
        const bg  = t.status==='pass'?'rgba(34,197,94,0.08)':t.status==='fail'?'rgba(220,38,38,0.08)':'rgba(245,158,11,0.08)';
        const icon = t.status==='pass'?'✓':t.status==='fail'?'✗':'⏭';
        const dur  = t.duration?(t.duration<1000?t.duration+'ms':(t.duration/1000).toFixed(1)+'s'):'—';
        const tcId = (t.name.match(/^(TC[_A-Z0-9]+)/)||[''])[0];
        const tcName = t.name.match(/^TC[_A-Z0-9]+\s+(.*)$/) ? t.name.match(/^TC[_A-Z0-9]+\s+(.*)$/)[1].trim().replace(/^[-–—]\s*/,'') : t.name;
        html += `
          <div style="border-top:1px solid var(--border);padding:9px 14px 9px 28px;background:${bg}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
              <span style="font-size:14px;color:${sc};font-weight:700;flex-shrink:0">${icon}</span>
              ${tcId?`<span style="font-size:12px;font-weight:700;color:var(--teal);flex-shrink:0">${escHtml(tcId)}:</span>`:''}
              <span style="font-size:12px;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(tcName)}</span>
              <span style="font-size:12px;color:var(--gray);flex-shrink:0">${dur}</span>
            </div>
            ${t.date||t.runId?`<div style="display:flex;gap:10px;font-size:12px;color:var(--gray)">
              ${t.date?`<span>📅 ${t.date}</span>`:''}
              ${t.runId?`<span>Run #${t.runId}</span>`:''}
            </div>`:''}
            ${t.message?`<div style="margin-top:5px;font-size:12px;color:#DC2626;background:rgba(220,38,38,0.06);border-radius:4px;padding:4px 8px;font-family:monospace;word-break:break-all">${escHtml(t.message.slice(0,200))}</div>`:''}
          </div>`;
      });
      html += `</div></div>`;
    });
  }

  let listEl = document.getElementById('apResultList');
  if (!listEl) {
    listEl = document.createElement('div');
    listEl.id = 'apResultList';
    content.appendChild(listEl);
  }
  listEl.innerHTML = html;
}

function renderAnalysisPanel() {
  const content = document.getElementById('analysisPanelContent');
  if (!content) return;
  const tab = content.dataset.tab || 'filter';
  if (tab === 'filter') renderFilterTab(content);
  else renderDiffTab(content);
}

function renderFilterTab(content) {
  const filters = content._filters || { status: 'all', search: '', page: 'all' };
  content._filters = filters;
  const all  = getAllTestResults();
  const pass = all.filter(t => t.status === 'pass').length;
  const fail = all.filter(t => t.status === 'fail').length;
  const skip = all.filter(t => t.status === 'skip').length;
  const pages = ['all', ...[...new Set(all.map(t => t.suite).filter(Boolean))]];

  content.innerHTML = '';

  const hdrDiv = document.createElement('div');
  const activeBtn = (s, label, count, color) => {
    const active = filters.status === s;
    const b = document.createElement('button');
    b.style.cssText = `flex:1;padding:7px 4px;font-size:12px;font-family:monospace;border-radius:6px;cursor:pointer;border:1px solid ${active?color:'var(--border)'};background:${active?'rgba(0,0,0,0.06)':'transparent'};color:${active?color:'var(--gray)'}`;
    b.innerHTML = `${label}<br><span style="font-size:13px;font-weight:700">${count}</span>`;
    b.onclick = () => _apFilter(s);
    return b;
  };

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:6px;margin-bottom:10px';
  btnRow.appendChild(activeBtn('all',  t('analysis.all'),  all.length, 'var(--teal)'));
  btnRow.appendChild(activeBtn('pass', t('analysis.pass'), pass,       '#22c55e'));
  btnRow.appendChild(activeBtn('fail', t('analysis.fail'), fail,       '#DC2626'));
  btnRow.appendChild(activeBtn('skip', t('analysis.skip'), skip,       '#f59e0b'));

  const searchInput = document.createElement('input');
  searchInput.id = 'apSearch';
  searchInput.type = 'text';
  searchInput.placeholder = t('analysis.searchPh');
  searchInput.value = filters.search || '';
  searchInput.style.cssText = 'width:100%;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:12px;font-family:monospace;color:var(--text);box-sizing:border-box';
  searchInput.oninput = () => _apSearch(searchInput.value);

  const filterBox = document.createElement('div');
  filterBox.style.cssText = 'padding:12px 14px;border-bottom:1px solid var(--border)';
  filterBox.appendChild(btnRow);
  filterBox.appendChild(searchInput);
  hdrDiv.appendChild(filterBox);

  if (pages.length > 2) {
    const pageRow = document.createElement('div');
    pageRow.style.cssText = 'padding:6px 14px 8px;border-bottom:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap';
    pages.forEach(p => {
      const active = (filters.page||'all') === p;
      const pb = document.createElement('button');
      pb.style.cssText = `padding:3px 10px;font-size:11px;font-family:monospace;border-radius:12px;cursor:pointer;border:1px solid ${active?'#c084fc':'var(--border)'};background:${active?'rgba(192,132,252,0.12)':'transparent'};color:${active?'#c084fc':'var(--gray)'}`;
      pb.textContent = p === 'all' ? t('analysis.pageAll') : p;
      pb.onclick = () => _apPage(p);
      pageRow.appendChild(pb);
    });
    hdrDiv.appendChild(pageRow);
  }

  content.appendChild(hdrDiv);

  const listDiv = document.createElement('div');
  listDiv.id = 'apResultList';
  listDiv.style.cssText = 'flex:1;overflow-y:auto;';
  content.appendChild(listDiv);

  // events définis globalement

  _apRenderList(content);

  if (filters.search) { searchInput.focus(); searchInput.setSelectionRange(searchInput.value.length,searchInput.value.length); }
}


function renderDiffTab(content) {
  const runs = getUniqueRuns();
  const sel  = content._diffSel || { a: null, b: null };
  content._diffSel = sel;

  const runOptions = runs.map(r => {
    const label = r.title || r.suite || '';
    return `<option value="${r.id}" style="font-size:12px">Run #${r.id}${label?' — '+label:''}${r.date?' | '+r.date:''}</option>`;
  }).join('');

  let html = `
    <div style="padding:12px 14px;border-bottom:1px solid var(--border)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <div style="font-size:12px;color:var(--gray);margin-bottom:4px;letter-spacing:1px">${t('analysis.runA')}</div>
          <select id="diffSelA" onchange="document.getElementById('analysisPanelContent')._diffSel.a=this.value;renderAnalysisPanel()"
            style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:12px;font-family:monospace;color:var(--text)">
            <option value="">${t('analysis.selectPlaceholder')}</option>${runOptions}
          </select>
        </div>
        <div>
          <div style="font-size:12px;color:var(--gray);margin-bottom:4px;letter-spacing:1px">${t('analysis.runB')}</div>
          <select id="diffSelB" onchange="document.getElementById('analysisPanelContent')._diffSel.b=this.value;renderAnalysisPanel()"
            style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:12px;font-family:monospace;color:var(--text)">
            <option value="">${t('analysis.selectPlaceholder')}</option>${runOptions}
          </select>
        </div>
      </div>
    </div>
  `;

  if (!sel.a || !sel.b) {
    html += `<div style="padding:32px;text-align:center;font-size:12px;color:var(--gray)">${t('analysis.pickTwoRuns')}</div>`;
    content.innerHTML = html;
    return;
  }

  const runA = runs.find(r => String(r.id) === String(sel.a));
  const runB = runs.find(r => String(r.id) === String(sel.b));
  if (!runA || !runB) { content.innerHTML = html; return; }

  const testsA = runA.tests || [];
  const testsB = runB.tests || [];
  const allNames = [...new Set([...testsA.map(t=>t.name), ...testsB.map(t=>t.name)])];

  const passA = testsA.filter(t=>(t.status||'').toLowerCase()==='pass').length;
  const passB = testsB.filter(t=>(t.status||'').toLowerCase()==='pass').length;
  const failA = testsA.filter(t=>(t.status||'').toLowerCase()==='fail').length;
  const failB = testsB.filter(t=>(t.status||'').toLowerCase()==='fail').length;

  html += `
    <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border)">
      <div style="padding:10px 14px;border-right:1px solid var(--border)">
        <div style="font-size:12px;font-weight:700;color:var(--teal);margin-bottom:4px">Run #${runA.id}</div>
        <div style="font-size:12px;color:var(--gray)">${runA.date||''} ${runA.suite||''}</div>
        <div style="display:flex;gap:8px;margin-top:6px">
          <span style="font-size:12px;font-weight:600;color:#22c55e">✓ ${passA}</span>
          <span style="font-size:12px;font-weight:600;color:#DC2626">✗ ${failA}</span>
        </div>
      </div>
      <div style="padding:10px 14px">
        <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:4px">Run #${runB.id}</div>
        <div style="font-size:12px;color:var(--gray)">${runB.date||''} ${runB.suite||''}</div>
        <div style="display:flex;gap:8px;margin-top:6px">
          <span style="font-size:12px;font-weight:600;color:#22c55e">✓ ${passB}</span>
          <span style="font-size:12px;font-weight:600;color:#DC2626">✗ ${failB}</span>
        </div>
      </div>
    </div>
    <div style="padding:6px 14px;font-size:12px;color:var(--gray);letter-spacing:1px;border-bottom:1px solid var(--border)">${(allNames.length>1?t('analysis.testCountMany'):t('analysis.testCountOne')).replace('{n}', allNames.length)}</div>
  `;

  allNames.forEach(name => {
    const tA = testsA.find(t=>t.name===name);
    const tB = testsB.find(t=>t.name===name);
    const sA = (tA?.status||'missing').toLowerCase();
    const sB = (tB?.status||'missing').toLowerCase();
    const lbl = s => s==='missing' ? t('analysis.missing') : s;
    const changed = sA !== sB;

    const statusCell = (s, msg) => {
      const color = s==='pass'?'#22c55e':s==='fail'?'#DC2626':s==='skip'?'#f59e0b':'var(--gray)';
      const bg    = s==='pass'?'rgba(34,197,94,0.10)':s==='fail'?'rgba(220,38,38,0.10)':s==='skip'?'rgba(245,158,11,0.10)':'transparent';
      const icon  = s==='pass'?'✓':s==='fail'?'✗':s==='skip'?'⏭':'—';
      return `<div style="padding:8px 10px;border-right:1px solid var(--border);background:${bg}">
        <span style="font-size:15px;color:${color};font-weight:700">${icon}</span>
        <span style="font-size:12px;color:${color};margin-left:5px;text-transform:uppercase;font-weight:600">${lbl(s)}</span>
        ${msg?`<div style="font-size:12px;color:#DC2626;margin-top:4px;word-break:break-all;font-family:monospace">${escHtml((msg||'').slice(0,100))}</div>`:''}
      </div>`;
    };

    html += `
      <div style="border-bottom:1px solid var(--border);background:${changed?'rgba(245,158,11,0.04)':'transparent'}">
        <div style="padding:6px 14px;font-size:12px;color:var(--text);${changed?'font-weight:600':''}border-bottom:1px solid rgba(255,255,255,0.05)">
          ${changed?'<span style="color:var(--warn);margin-right:6px">⚠</span>':''}${escHtml(name)}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr">
          ${statusCell(sA, tA?.message)}
          ${statusCell(sB, tB?.message)}
        </div>
      </div>
    `;
  });

  content.innerHTML = html;
  // Restaurer les selects
  const selA = document.getElementById('diffSelA');
  const selB = document.getElementById('diffSelB');
  if (selA) selA.value = sel.a;
  if (selB) selB.value = sel.b;
}
