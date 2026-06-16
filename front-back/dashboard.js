// ============================================================================
// dashboard.js — panneau Dashboard inline + barre de stats (openDashboard,
//                closeDashboardPanel, updateStatsBar, restoreStatsBar).
// ============================================================================

// ── Open dashboard inline ──────────────────────────────────────────────────────
function openDashboard() {
  const panel = document.getElementById('dashboardPanel');
  if (!panel) { window.open('dashboard.html', '_blank'); return; }
  if (panel.style.display === 'flex') {
    closeDashboardPanel();
    return;
  }
  panel.style.display       = 'flex';
  panel.style.flexDirection = 'column';
  const btn = document.querySelector('[onclick="openDashboard()"]');
  if (btn) btn.classList.add('active');
  // Setup resize handle
  const handle = document.getElementById('dashboardPanelHandle');
  if (handle && !handle._resizeInit) {
    handle._resizeInit = true;
    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      const startX = e.clientX;
      const startW = panel.offsetWidth;
      const onMove = function(ev) {
        const newW = Math.min(Math.max(startW + (startX - ev.clientX), 400), window.innerWidth * 0.95);
        panel.style.width = newW + 'px';
      };
      const onUp = function() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }
}

function closeDashboardPanel() {
  const panel = document.getElementById('dashboardPanel');
  if (panel) panel.style.display = 'none';
  const btn = document.querySelector('[onclick="openDashboard()"]');
  if (btn) btn.classList.remove('active');
}











// ── Stats bar update ─────────────────────────────────────────────────────────







function updateStatsBar() {
  try {
    const allCards = window._codeCards || [];

    // 1. Cas de tests — depuis TC_STORE (en mémoire)
    const tcFromStore = Object.values(window.TC_STORE||{}).reduce((s,v) => {
      return s + (v?.pages
        ? v.pages.reduce((ps, p) => ps + (p.cases?.length||0), 0)
        : (v?.cases?.length||0));
    }, 0);
    // Fallback après reload : cumul de TOUS les rapports
    const allReports = allCards.filter(c => c.type === 'report' && c.data);
    const tcFallback = allReports.reduce((s,c) => s + (c.data?.total||0), 0);
    const tcCount = tcFromStore > 0 ? tcFromStore : tcFallback;

    // 2. Tests RF lancés — rapports simples uniquement (hors suites)
    const simpleReports = allCards.filter(c => c.type === 'report' && c.data && !c.data.isSuite);
    const runsCount = simpleReports.length;

    // 3. Réussis / Échoués / Taux — tous les rapports (simples + suites)
    const passed = allReports.reduce((s,c) => s + (c.data?.passed||0), 0);
    const failed = allReports.reduce((s,c) => s + (c.data?.failed||0), 0);
    const total  = allReports.reduce((s,c) => s + (c.data?.total ||0), 0);
    const rate   = total > 0 ? Math.round(passed/total*100) : 0;

    // 4. Suites lancées
    const suiteReports = allCards.filter(c => c.type === 'suite-report');
    const suites = new Set(suiteReports.map(c => c.suiteTitle || c.cardId)).size;

    const set = (id, val, suffix='') => {
      const el = document.getElementById(id);
      if (el) el.textContent = (val ?? 0) + suffix;
    };
    set('statTC',        tcCount);
    set('statGenerated', runsCount);
    set('statPassed',    passed);
    set('statFailed',    failed);
    set('statRate',      rate, '%');
    set('statSuites',    suites);
    try { localStorage.setItem('qa_stats', JSON.stringify({tcCount, total: runsCount, passed, failed, rate, suites})); } catch(e) {}
  } catch(e) { console.error('updateStatsBar error:', e); }
}


function restoreStatsBar() {
  try {
    const s = JSON.parse(localStorage.getItem('qa_stats') || '{}');
    const set = (id, val, suffix='') => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.textContent = val + suffix;
    };
    set('statTC',        s.tcCount ?? 0);
    set('statGenerated', s.total   ?? 0);
    set('statPassed',    s.passed  ?? 0);
    set('statFailed',    s.failed  ?? 0);
    set('statRate',      s.rate    ?? 0, '%');
    set('statSuites',    s.suites  ?? 0);
  } catch(e) {}
}
