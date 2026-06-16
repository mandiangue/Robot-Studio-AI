// ============================================================================
// live.js — panneau Live (SSE temps réel) : LIVE_SERVER, _liveState, fmtLive,
//           renderLiveTimeline/Panel, connectLive, openLivePanel.
// ============================================================================

// ══════════════════════════════════════════════════════════════════════════════
// LIVE PANEL — Workflow en temps réel
// ══════════════════════════════════════════════════════════════════════════════
const LIVE_SERVER = 'http://localhost:3001';
let _liveEvtSource = null;
let _liveState = { runs: [], suites: [] };
let _livePanelOpen = false;

function fmtLive(ms) {
  if (!ms || ms < 0) return '—';
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms/1000).toFixed(1) + 's';
  return Math.floor(ms/60000) + 'm ' + Math.floor((ms%60000)/1000) + 's';
}

function shortTC(name) {
  if (!name) return '?';
  return name.length <= 28 ? name : name.slice(0, 26) + '…';
}

function renderLiveTimeline(tests) {
  if (!tests || tests.length === 0) {
    return '<div style="padding:10px 16px;font-size:12px;color:var(--gray);font-style:italic">En attente...</div>';
  }
  let html = '<div style="overflow-x:auto;padding:14px 16px 16px"><div style="display:flex;align-items:center;min-width:max-content">';
  tests.forEach((t, i) => {
    const s = (t.status||'pending').toLowerCase();
    const icon = s==='pass'?'✓':s==='fail'?'✗':s==='running'?'⋯':s==='skip'?'⏭':'○';
    const circleColor = s==='pass'?'var(--green)':s==='fail'?'var(--red)':s==='running'?'var(--teal)':s==='skip'?'var(--warn)':'var(--gray)';
    const bg = s==='pass'?'rgba(34,197,94,0.12)':s==='fail'?'rgba(220,38,38,0.12)':s==='running'?'rgba(0,212,170,0.08)':s==='skip'?'rgba(245,158,11,0.10)':'var(--card)';
    const anim = s==='running'?'animation:lp-pulse 1s infinite;':'';
    const scale = (s==='pass'||s==='fail')?'transform:scale(1.1);':'';
    const shadow = s==='pass'?'box-shadow:0 0 8px rgba(34,197,94,0.3);':s==='fail'?'box-shadow:0 0 8px rgba(220,38,38,0.3);':s==='running'?'box-shadow:0 0 8px rgba(0,212,170,0.3);':'';
    const tooltip = t.message ? ' title="'+escHtml(t.message.slice(0,100))+'"' : '';
    html += `<div style="display:flex;flex-direction:column;align-items:center;gap:5px"${tooltip}>
      <div style="width:38px;height:38px;border-radius:50%;border:2px solid ${circleColor};background:${bg};
                  display:flex;align-items:center;justify-content:center;font-size:14px;color:${circleColor};
                  ${scale}${shadow}${anim}transition:all .4s;cursor:default">${icon}</div>
      <div style="font-size:12px;color:${circleColor};text-align:center;max-width:90px;word-break:break-word;line-height:1.3">${escHtml(shortTC(t.name))}</div>
    </div>`;
    if (i < tests.length - 1) {
      const nextS = (tests[i+1]?.status||'pending').toLowerCase();
      // Trait : rouge si l'un fail, orange si l'un skip, vert si les deux pass
      const lineColor = (s==='fail' || nextS==='fail') ? 'var(--red)' : (s==='skip' || nextS==='skip') ? 'var(--warn)' : (s==='pass' && nextS==='pass') ? 'var(--green)' : 'var(--border)';
      html += `<div style="width:32px;height:2px;background:${lineColor};flex-shrink:0;margin-bottom:26px;align-self:flex-start;margin-top:18px;transition:background .4s"></div>`;
    }
  });
  // End node
  const allDone = tests.every(t => ['pass','fail','skip'].includes((t.status||'').toLowerCase()));
  const anyFail = tests.some(t => (t.status||'').toLowerCase()==='fail');
  const lastTestStatus = (tests[tests.length-1]?.status||'pending').toLowerCase();
  const lastLineColor = lastTestStatus==='pass'?'var(--green)':lastTestStatus==='fail'?'var(--red)':lastTestStatus==='skip'?'var(--warn)':lastTestStatus==='running'?'var(--teal)':'var(--border)';
  const endColor = !allDone?'var(--gray)':anyFail?'var(--red)':'var(--green)';
  const endIcon  = !allDone?'⋯':anyFail?'✗':'✓';
  html += `<div style="width:24px;height:2px;background:${lastLineColor};flex-shrink:0;margin-bottom:22px;transition:background .4s"></div>`;
  html += `<div style="width:28px;height:28px;border-radius:50%;border:2px solid ${endColor};background:var(--card);
              display:flex;align-items:center;justify-content:center;font-size:12px;color:${endColor};
              margin-bottom:22px;transition:all .4s">${endIcon}</div>`;
  html += '</div></div>';
  return html;
}

function renderLivePanel() {
  const panel = document.getElementById('livePanel');
  if (!panel) return;

  const runs   = _liveState.runs || [];
  const suites = _liveState.suites || [];

  let html = `<style>
    @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  </style>`;

  // Runs simples
  html += `<div style="font-size:10px;color:var(--gray);letter-spacing:1.5px;padding:10px 14px 6px;border-bottom:1px solid var(--border)">
    🔵 RUNS SIMPLES <span style="background:var(--card);border:1px solid var(--border);color:var(--teal);padding:1px 7px;border-radius:8px;font-size:9px">${runs.length}</span>
  </div>`;

  if (runs.length === 0) {
    html += '<div style="padding:16px 14px;font-size:12px;color:var(--gray);font-style:italic">Aucun run lancé...</div>';
  } else {
    [...runs].reverse().forEach(run => {
      const done = run.status==='pass'||run.status==='fail';
      const sc = !done?'var(--teal)':run.status==='pass'?'var(--green)':'var(--red)';
      const badge = !done?'⋯ EN COURS':run.status==='pass'?'✅ PASS':'❌ FAIL';
      const passed = (run.tests||[]).filter(t=>t.status==='pass').length;
      const failed = (run.tests||[]).filter(t=>t.status==='fail').length;
      html += `<div style="border-left:3px solid ${sc};margin:8px 10px;background:var(--card);border-radius:0 8px 8px 0">
        <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;flex-wrap:wrap">
          <span style="font-size:10px;color:var(--blue);font-family:'IBM Plex Mono',monospace">#${run.id}</span>
          ${run.title?`<span style="font-size:13px;color:var(--teal);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;font-weight:600">${escHtml(run.title)}</span>`:''}
          <span style="font-size:9px;color:${sc};margin-left:auto">${badge}</span>
          ${passed>0?`<span style="font-size:9px;color:var(--green)">✓${passed}</span>`:''}
          ${failed>0?`<span style="font-size:12px;color:#DC2626">✗${failed}</span>`:''}
        </div>
        ${renderLiveTimeline(run.tests||[])}
      </div>`;
    });
  }

  // Suites
  html += `<div style="font-size:10px;color:var(--gray);letter-spacing:1.5px;padding:10px 14px 6px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-top:6px">
    🧪 SUITES <span style="background:var(--card);border:1px solid var(--border);color:var(--teal);padding:1px 7px;border-radius:8px;font-size:9px">${suites.length}</span>
  </div>`;

  if (suites.length === 0) {
    html += '<div style="padding:16px 14px;font-size:12px;color:var(--gray);font-style:italic">Aucune suite lancée...</div>';
  } else {
    [...suites].reverse().forEach(suite => {
      const done = suite.status==='pass'||suite.status==='fail';
      const sc = !done?'var(--teal)':suite.status==='pass'?'var(--green)':'var(--red)';
      const badge = !done?'⋯ EN COURS':suite.status==='pass'?'✅ PASS':'❌ FAIL';
      html += `<div style="border-left:3px solid ${sc};margin:8px 10px;background:var(--card);border-radius:0 8px 8px 0">
        <div style="display:flex;align-items:center;gap:6px;padding:8px 12px">
          <span style="font-size:13px;color:var(--warn);font-weight:700">${escHtml(suite.title)}</span>
          <span style="font-size:9px;color:${sc};margin-left:auto">${badge}</span>
        </div>`;
      (suite.blocs||[]).forEach((bloc, bi) => {
        html += `<div style="padding:2px 12px 0">
          <div style="font-size:12px;color:#c084fc;padding:3px 0">📁 ${escHtml(bloc.name||('Bloc '+(bi+1)))}</div>
          ${renderLiveTimeline(bloc.tests||[])}
        </div>`;
      });
      html += '</div>';
    });
  }

  panel.innerHTML = html;
}

function connectLive() {
  if (_liveEvtSource) _liveEvtSource.close();
  _liveEvtSource = new EventSource(LIVE_SERVER + '/api/rf/live-stream');

  _liveEvtSource.addEventListener('state', e => {
    _liveState = JSON.parse(e.data);
    if (_livePanelOpen) renderLivePanel();
  });
  _liveEvtSource.addEventListener('run-start', e => {
    const r = JSON.parse(e.data);
    _liveState.runs.push(r);
    if (_livePanelOpen) renderLivePanel();
  });
  _liveEvtSource.addEventListener('run-update', e => {
    const upd = JSON.parse(e.data);
    const r = _liveState.runs.find(x => x.id === upd.id);
    if (r) Object.assign(r, upd);
    if (_livePanelOpen) renderLivePanel();
  });
  _liveEvtSource.addEventListener('suite-start', e => {
    const s = JSON.parse(e.data);
    _liveState.suites.push(s);
    if (_livePanelOpen) renderLivePanel();
  });
  _liveEvtSource.addEventListener('suite-update', e => {
    const upd = JSON.parse(e.data);
    const s = _liveState.suites.find(x => x.id === upd.id);
    if (s) Object.assign(s, upd);
    if (_livePanelOpen) renderLivePanel();
  });
  _liveEvtSource.addEventListener('reset', () => {
    _liveState = { runs: [], suites: [] };
    if (_livePanelOpen) renderLivePanel();
  });

  // Sync disque → UI : mise à jour depuis VS Code
  _liveEvtSource.addEventListener('file-changed', e => {
    const { filepath, content } = JSON.parse(e.data);
    // Mettre à jour toutes les cartes qui contiennent ce fichier
    let updated = false;
    let _changedCard2 = null;
    (window._codeCards||[]).forEach(card => {
      if (!card.files) return;
      const f = card.files.find(f => f.filename === filepath || f.filename.endsWith('/' + filepath.split('/').pop()));
      if (f && f.code !== content) {
        f.code = content;
        updated = true;
        _changedCard2 = card;
      }
    });
    if (updated) {
      saveCodeCards();
      _rerenderCardIfRendered(_changedCard2);
      showToast('🔄 Fichier mis à jour depuis VS Code : ' + filepath.split('/').pop());
    }
  });

  _liveEvtSource.onerror = () => setTimeout(connectLive, 3000);
}
function openLivePanel() {
  let panel = document.getElementById('livePanelOverlay');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    _livePanelOpen = panel.style.display !== 'none';
    if (_livePanelOpen) renderLivePanel();
    return;
  }

  _livePanelOpen = true;

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'livePanelOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:800;display:flex;justify-content:flex-end;pointer-events:none';

  // Panel
  const panelEl = document.createElement('div');
  panelEl.style.cssText = `
    width:480px;min-width:320px;max-width:90vw;height:100vh;
    background:var(--surface);border-left:1px solid var(--border);
    display:flex;flex-direction:column;pointer-events:all;
    box-shadow:-4px 0 24px rgba(0,0,0,0.4);position:relative;
    transition:width .2s;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--card);border-bottom:1px solid var(--border);flex-shrink:0';
  header.innerHTML = `
    <span id="liveDot" style="width:9px;height:9px;border-radius:50%;background:var(--gray);transition:background .3s"></span>
    <span style="font-size:12px;font-weight:700;color:var(--teal);letter-spacing:1px">🤖 LIVE</span>
    <button onclick="fetch('http://localhost:3001/api/rf/live-reset',{method:'POST'}).then(()=>{_liveState={runs:[],suites:[]};renderLivePanel()})"
      style="background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.3);color:var(--red);padding:3px 9px;border-radius:5px;font-size:10px;font-family:monospace;cursor:pointer;margin-left:auto">🗑 Reset</button>
    <button onclick="document.getElementById('livePanelOverlay').style.display='none';_livePanelOpen=false"
      style="background:transparent;border:none;color:var(--gray);font-size:16px;cursor:pointer;padding:2px 4px" title="Fermer">✕</button>
  `;

  // Resize handle
  const handle = document.createElement('div');
  handle.id = 'livePanelHandle';
  handle.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:5px;cursor:ew-resize;background:transparent;z-index:10';
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelEl.offsetWidth;
    const onMove = mv => {
      const newW = Math.min(Math.max(startW + (startX - mv.clientX), 320), window.innerWidth * 0.9);
      panelEl.style.width = newW + 'px';
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Content
  const content = document.createElement('div');
  content.id = 'livePanel';
  content.style.cssText = 'flex:1;overflow-y:auto;';

  panelEl.appendChild(handle);
  panelEl.appendChild(header);
  panelEl.appendChild(content);
  overlay.appendChild(panelEl);
  document.body.appendChild(overlay);

  // Click outside to close
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { overlay.style.display='none'; _livePanelOpen=false; }
  });

  connectLive();
  renderLivePanel();

  // Update live dot
  setInterval(() => {
    const dot = document.getElementById('liveDot');
    if (!dot) return;
    const anyRunning = [...(_liveState.runs||[]),...(_liveState.suites||[])].some(r=>r.status==='running');
    dot.style.background = anyRunning ? 'var(--green)' : _liveState.runs.length>0||_liveState.suites.length>0 ? 'var(--teal)' : 'var(--gray)';
    dot.style.animation = anyRunning ? 'liveDotPulse 1s infinite' : 'none';
  }, 500);
}
