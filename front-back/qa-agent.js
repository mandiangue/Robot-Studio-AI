





// ── Import CSV/XLS -> bloc de cas de test ──────────────────────────────────
function _ensureXLSX() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('cdn'));
    document.head.appendChild(s);
  });
}
function _parseDelimited(text, delim) {
  const rows = []; let row = []; let cur = ''; let i = 0; let inQ = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      cur += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === delim) { row.push(cur); cur = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; i++; continue; }
    cur += ch; i++;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => (c || '').trim() !== ''));
}
function _tcRowsToCases(rows) {
  if (!rows || !rows.length) return { cases: [], url: '' };
  const norm = s => (s == null ? '' : String(s)).trim().toLowerCase();
  const header = rows[0].map(norm);
  const find = re => header.findIndex(h => re.test(h));
  let iName = find(/nom|name|titre|title|libell|sc[ea]nario|\bcas\b|case/);
  let iDesc = find(/desc|[ea]tape|step|action|proc[ea]dure/);
  let iExp  = find(/attendu|expected|r[ea]sultat|result|oracle|v[ea]rif/);
  let iId   = find(/^id$|^tc|^n[o0]|num|^ref/);
  let iUrl  = find(/url|lien|adresse|^site/);
  const hasHeader = (iName >= 0 || iDesc >= 0 || iExp >= 0);
  let dataRows;
  if (hasHeader) {
    dataRows = rows.slice(1);
    if (iName < 0) iName = 0;
    if (iDesc < 0) iDesc = (iName === 0 ? 1 : 0);
    if (iExp === iDesc) iExp = -1;
  } else {
    dataRows = rows;
    const w = rows[0].length;
    iName = 0; iDesc = w > 1 ? 1 : -1; iExp = w > 2 ? 2 : -1; iId = -1; iUrl = -1;
  }
  const cases = []; let url = ''; let n = 0;
  dataRows.forEach(r => {
    const g = i => (i >= 0 && r[i] != null ? String(r[i]).trim() : '');
    const name = g(iName), desc = g(iDesc), exp = g(iExp);
    if (!name && !desc && !exp) return;
    n++;
    cases.push({
      id: n,
      testId: 'TC_' + String(n).padStart(3, '0'),
      name: name || ('Cas ' + n),
      description: desc,
      expected: exp
    });
    if (iUrl >= 0 && !url && g(iUrl)) url = g(iUrl);
  });
  if (!url) { const m = rows.flat().join(' ').match(/https?:\/\/\S+/); if (m) url = m[0]; }
  return { cases, url };
}
function importTCFromFile(file) {
  if (!file) return;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const finish = rows => {
    const out = _tcRowsToCases(rows);
    if (!out.cases.length) { showToast('\u26a0\ufe0f Aucun cas d\u00e9tect\u00e9 dans le fichier'); return; }
    if (typeof renderTestCasesCard !== 'function') { showToast('\u26a0\ufe0f renderTestCasesCard introuvable'); return; }
    renderTestCasesCard(out.cases, out.url, true);
    showToast('\U0001F4E5 ' + out.cases.length + ' cas import\u00e9(s)' + (out.url ? ' \u00b7 ' + out.url : ''));
  };
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const firstLine = (text.split(/\r?\n/).find(l => l.trim()) || '');
      const counts = {
        ',': (firstLine.match(/,/g) || []).length,
        ';': (firstLine.match(/;/g) || []).length,
        '\t': (firstLine.match(/\t/g) || []).length
      };
      const delim = [',', ';', '\t'].reduce((a, b) => counts[b] > counts[a] ? b : a, ',');
      finish(_parseDelimited(text, delim));
    };
    reader.onerror = () => showToast('\u26a0\ufe0f Lecture du fichier impossible');
    reader.readAsText(file, 'utf-8');
  } else if (ext === 'xlsx' || ext === 'xls') {
    showToast('\u23f3 Chargement du lecteur Excel...');
    _ensureXLSX().then(() => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const wb = XLSX.read(new Uint8Array(reader.result), { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });
          finish(rows.map(r => (r || []).map(c => (c == null ? '' : String(c)))));
        } catch (e) { showToast('\u26a0\ufe0f Lecture XLSX impossible : ' + e.message); }
      };
      reader.onerror = () => showToast('\u26a0\ufe0f Lecture du fichier impossible');
      reader.readAsArrayBuffer(file);
    }).catch(() => showToast('\u26a0\ufe0f Lecteur XLSX non charg\u00e9 (hors-ligne ?). Exporte en CSV.'));
  } else {
    showToast('\u26a0\ufe0f Format non support\u00e9 (CSV, TSV ou XLSX)');
  }
}

// ── Import projet Robot Framework (dossier) -> bloc multi-fichiers ──────────
function _rfResolve(baseDir, rel) {
  rel = String(rel || '').replace(/\\/g, '/').trim();
  if (!rel || rel.startsWith('/') || /^[a-zA-Z]:/.test(rel)) return null;
  const parts = baseDir ? baseDir.split('/').filter(Boolean) : [];
  rel.split('/').forEach(seg => {
    if (seg === '' || seg === '.') return;
    if (seg === '..') { if (parts.length) parts.pop(); }
    else parts.push(seg);
  });
  return parts.join('/');
}
function _rfRelPath(fromDir, toPath) {
  const f = (fromDir ? fromDir.split('/') : []).filter(Boolean);
  const t = toPath.split('/');
  let i = 0;
  while (i < f.length && i < t.length - 1 && f[i] === t[i]) i++;
  const up = f.slice(i).map(() => '..');
  const out = up.concat(t.slice(i)).join('/');
  return out || t[t.length - 1];
}
function _rfClassify(relPath, content) {
  const parts = relPath.split('/');
  const base = parts.pop();
  const dir = parts.join('/');
  const lower = base.toLowerCase();
  const ext = (lower.split('.').pop() || '');
  const strip = (re) => dir.replace(re, '').replace(/^\/+|\/+$/g, '');
  if (ext === 'yml' || ext === 'yaml') return base;
  if (/^requirements([._-].*)?\.txt$/i.test(base)) return base;
  if (ext === 'py') {
    const sub = strip(/^(libs?|resources?|res)(\/|$)/i);
    return 'resources/libs/' + (sub ? sub + '/' : '') + base;
  }
  if (lower === '__init__.robot') {
    const sub = strip(/^(tests?|suites?)(\/|$)/i);
    return 'tests/' + (sub ? sub + '/' : '') + '__init__.robot';
  }
  const isRF = ext === 'robot' || ext === 'resource' ||
    (ext === 'txt' && /\*\*\*+\s*(settings|variables|keywords|test cases|tasks)\s*\*\*\*+/i.test(content));
  if (isRF) {
    const hasTests = /\*\*\*+\s*(test cases|tasks)\s*\*\*\*+/i.test(content);
    const newBase = base.replace(/\.(resource|txt)$/i, '.robot');
    if (hasTests) {
      const sub = strip(/^(tests?|suites?|tc)(\/|$)/i);
      return 'tests/' + (sub ? sub + '/' : '') + newBase;
    }
    const sub = strip(/^(resources?|res)(\/|$)/i);
    return 'resources/' + (sub ? sub + '/' : '') + newBase;
  }
  const sub = strip(/^(resources?|res)(\/|$)/i);
  return 'resources/' + (sub ? sub + '/' : '') + base;
}
function _rewriteRFImports(content, fromOldDir, fromNewPath, mapOldToNew) {
  const fromNewDir = fromNewPath.split('/').slice(0, -1).join('/');
  return content.split('\n').map(line => {
    const m = line.match(/^(\s*)(Resource|Library|Variables)(\s{2,}|\t+)(\S+)(.*)$/i);
    if (!m) return line;
    const token = m[4];
    const cands = [token, token + '.py', token + '.robot', token + '.resource'];
    for (const cand of cands) {
      const resolved = _rfResolve(fromOldDir, cand);
      if (resolved && mapOldToNew[resolved]) {
        return m[1] + m[2] + m[3] + _rfRelPath(fromNewDir, mapOldToNew[resolved]) + m[5];
      }
    }
    return line;
  }).join('\n');
}
function _buildRFCard(entries) {
  const used = {};
  const mapOldToNew = {};
  entries.forEach(e => {
    let np = _rfClassify(e.relPath, e.content);
    if (used[np]) {
      const dot = np.lastIndexOf('.');
      let i = 2, cand;
      do { cand = np.slice(0, dot) + '_' + i + np.slice(dot); i++; } while (used[cand]);
      np = cand;
    }
    used[np] = true;
    mapOldToNew[e.relPath] = np;
  });
  const files = entries.map(e => {
    const np = mapOldToNew[e.relPath];
    const oldDir = e.relPath.split('/').slice(0, -1).join('/');
    let code = e.content;
    if (/\.robot$/i.test(np)) code = _rewriteRFImports(code, oldDir, np, mapOldToNew);
    const base = np.split('/').pop();
    return { filename: np, code, label: base.replace(/\.[^.]+$/, ''), desc: 'Import\u00e9' };
  });
  const rank = f => {
    const fn = f.filename;
    if (fn === 'resources/variables.robot') return 0;
    if (fn === 'resources/keywords.robot') return 1;
    if (fn.startsWith('resources/pages/')) return 2;
    if (fn.startsWith('resources/libs/')) return 3;
    if (fn.startsWith('resources/')) return 4;
    if (fn === 'tests/__init__.robot') return 5;
    if (fn.startsWith('tests/')) return 6;
    return 7;
  };
  files.sort((a, b) => rank(a) - rank(b) || a.filename.localeCompare(b.filename));
  return files;
}
function _rfImportModal(title, files) {
  const esc = (typeof escHtml === 'function') ? escHtml : (s => String(s == null ? '' : s));
  const bin = files.filter(f => f.binary).length;
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  const rows = files.map(f =>
    '<div style="display:flex;align-items:center;gap:8px;padding:3px 0;font-family:monospace;font-size:12px;color:var(--text,#e2e8f0)">'
    + '<span style="color:' + (f.binary ? '#c084fc' : 'var(--teal,#2dd4bf)') + '">' + (f.binary ? '\u25A0' : '\u25A1') + '</span>'
    + '<span>' + esc(f.filename) + '</span>'
    + (f.binary ? ' <span style="color:var(--gray,#9ca3af);font-size:10px">[binaire]</span>' : '')
    + '</div>'
  ).join('');
  ov.innerHTML =
    '<div style="background:var(--surface,#15202b);border:1px solid var(--border,#2a3744);border-radius:14px;max-width:660px;width:100%;max-height:82vh;display:flex;flex-direction:column;overflow:hidden">'
    + '<div style="padding:16px 20px;border-bottom:1px solid var(--border,#2a3744);font-family:Syne,sans-serif;font-weight:700;font-size:16px;color:var(--text,#e2e8f0)">\uD83D\uDCC2 Importer le projet \u00ab ' + esc(title) + ' \u00bb</div>'
    + '<div style="padding:10px 20px 6px;color:var(--gray,#9ca3af);font-size:13px">' + files.length + ' fichier(s)' + (bin ? ' \u00b7 ' + bin + ' binaire(s) (images / DICOM)' : '') + ' \u2014 reclass\u00e9s vers tests/ + resources/ :</div>'
    + '<div style="padding:0 20px 8px;overflow:auto;flex:1">' + rows + '</div>'
    + '<div style="padding:14px 20px;border-top:1px solid var(--border,#2a3744);display:flex;gap:10px;justify-content:flex-end">'
    + '<button id="_rfCancel" style="background:transparent;border:1px solid var(--border,#2a3744);color:var(--text,#e2e8f0);padding:8px 16px;border-radius:8px;cursor:pointer">Annuler</button>'
    + '<button id="_rfOk" style="background:var(--teal,#2dd4bf);border:none;color:#06202a;font-weight:700;padding:8px 18px;border-radius:8px;cursor:pointer">Importer</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#_rfCancel').onclick = close;
  ov.querySelector('#_rfOk').onclick = () => {
    const cardId = 'result-' + Date.now();
    window._lastGeneratedTitle = title;
    window._codeCards = window._codeCards || [];
    window._codeCards.push({ type: 'multi', cardId, title, files: files.map(f => ({ ...f })) });
    if (typeof saveCodeCards === 'function') saveCodeCards();
    if (typeof renderResultCard === 'function') renderResultCard(files, cardId);
    close();
    showToast('\uD83D\uDCC2 Projet \u00ab ' + title + ' \u00bb import\u00e9 \u2014 ' + files.length + ' fichier(s)');
  };
}
function _rfMediaDrop(rp) {
  return /(^|\/)(node_modules|\.git|__pycache__|\.venv|venv|\.idea|\.vscode|\.cache)(\/|$)/i.test(rp)
    || /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini|\.gitignore|\.gitkeep|\.gitattributes|\.dockerignore|\.editorconfig|output\.xml|log\.html|report\.html)$/i.test(rp)
    || /\.(png|jpe?g|gif|bmp|webp|svg|ico|tiff?|mp4|avi|mov|mkv|webm|flv|wmv|m4v|mp3|wav|ogg|aac|log|zip|tar|gz|rar|7z|exe|dll|so|dylib|class|jar|woff2?|eot|ttf|pyc|tmp|temp|bak|swp|swo|pdf)$/i.test(rp);
}
async function _rfReadDropEntry(entry, prefix, out) {
  if (!entry) return;
  if (entry.isFile) {
    await new Promise(res => entry.file(f => { out.push({ file: f, rel: prefix + entry.name }); res(); }, () => res()));
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const readBatch = () => new Promise(res => reader.readEntries(es => res(es), () => res([])));
    let batch;
    do { batch = await readBatch(); for (const e of batch) await _rfReadDropEntry(e, prefix + entry.name + '/', out); } while (batch.length);
  }
}
async function _rfProcessDropped(fileRecs) {
  const kept = fileRecs.filter(r => !_rfMediaDrop(r.rel));
  if (!kept.length) { showToast('\u26a0\ufe0f Aucun fichier exploitable (media/logs/tmp ignor\u00e9s)'); return; }
  const rootSeg = (kept[0].rel.split('/')[0]) || 'Projet RF';
  const DCM = /\.(dcm|dicom)$/i;
  const readDataURL = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
  const entries = await Promise.all(kept.map(async r => {
    const relPath = r.rel.split('/').slice(1).join('/') || r.rel;
    const cap = DCM.test(r.rel) ? 8 * 1024 * 1024 : 1024 * 1024;
    if (r.file.size > cap) return null;
    if (DCM.test(r.rel)) return { relPath, content: await readDataURL(r.file), binary: true };
    return { relPath, content: await r.file.text(), binary: false };
  }));
  const clean = entries.filter(Boolean);
  if (!clean.filter(e => /\.(robot|resource)$/i.test(e.relPath)).length) { showToast('\u26a0\ufe0f Aucun .robot/.resource trouv\u00e9'); return; }
  _rfImportModal(rootSeg, _buildRFCard(clean));
}
function _rfOpenImportModal() {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML =
    '<div style="background:var(--surface,#15202b);border:1px solid var(--border,#2a3744);border-radius:14px;max-width:560px;width:100%;overflow:hidden">'
    + '<div style="padding:16px 20px;border-bottom:1px solid var(--border,#2a3744);font-family:Syne,sans-serif;font-weight:700;font-size:16px;color:var(--text,#e2e8f0)">\uD83D\uDCC2 Importer un projet Robot Framework</div>'
    + '<div id="_rfDrop" style="margin:20px;padding:42px 20px;border:2px dashed var(--border,#2a3744);border-radius:12px;text-align:center;color:var(--gray,#9ca3af);font-size:14px">Glisse le dossier du projet ici<br><span style="font-size:12px">sous-dossiers inclus \u2014 media, logs et tmp ignor\u00e9s</span></div>'
    + '<div style="padding:0 20px 16px;display:flex;gap:10px;justify-content:space-between;align-items:center">'
    + '<span style="color:var(--gray,#9ca3af);font-size:12px">\u2026 ou <a href="#" id="_rfPick" style="color:var(--teal,#2dd4bf)">choisir un dossier</a></span>'
    + '<button id="_rfClose" style="background:transparent;border:1px solid var(--border,#2a3744);color:var(--text,#e2e8f0);padding:8px 16px;border-radius:8px;cursor:pointer">Fermer</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#_rfClose').onclick = close;
  ov.querySelector('#_rfPick').onclick = (e) => { e.preventDefault(); close(); document.getElementById('rfProjectInput').click(); };
  const dz = ov.querySelector('#_rfDrop');
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = 'var(--teal,#2dd4bf)'; });
  dz.addEventListener('dragleave', e => { e.preventDefault(); dz.style.borderColor = 'var(--border,#2a3744)'; });
  dz.addEventListener('drop', async e => {
    e.preventDefault();
    const items = Array.from(e.dataTransfer.items || []);
    const out = [];
    dz.innerHTML = '\u23f3 Lecture du dossier\u2026';
    await Promise.all(items.map(it => { const ent = it.webkitGetAsEntry && it.webkitGetAsEntry(); return ent ? _rfReadDropEntry(ent, '', out) : Promise.resolve(); }));
    close();
    await _rfProcessDropped(out);
  });
}
async function importRFProject(fileList) {
  const all = Array.from(fileList || []);
  if (!all.length) return;
  const SKIP_DIR = /(^|\/)(node_modules|\.git|__pycache__|\.venv|venv|env|results?|output|logs?|dist|build|\.idea|\.vscode)(\/|$)/i;
  const SKIP_FILE = /(output\.xml|log\.html|report\.html|\.(png|jpe?g|gif|svg|zip|tar|gz|pyc|exe|dll|class|jar|ico|pdf|mp4|woff2?|ttf))$/i;
  const KEEP = /\.(robot|resource|txt|py|yaml|yml|json|csv)$/i;
  const rootSeg = (all[0].webkitRelativePath || all[0].name).split('/')[0];
  const title = rootSeg || 'Projet RF';
  const picked = all.filter(f => {
    const rp = (f.webkitRelativePath || f.name);
    if (SKIP_DIR.test(rp) || SKIP_FILE.test(rp)) return false;
    if (/(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini|\.gitignore|\.gitkeep|\.gitattributes|\.dockerignore|\.editorconfig)$/i.test(rp)) return false;
    if (/\.(png|jpe?g|gif|bmp|webp|svg|ico|tiff?|mp4|avi|mov|mkv|webm|flv|wmv|m4v|mp3|wav|ogg|aac|log|zip|tar|gz|rar|7z|exe|dll|so|dylib|class|jar|woff2?|eot|ttf|pyc|tmp|temp|bak|swp|swo|pdf)$/i.test(rp)) return false;
    const _max = /\.(png|jpe?g|gif|bmp|webp|ico|pdf|dcm|dicom)$/i.test(rp) ? 8 * 1024 * 1024 : 1024 * 1024;
    if (f.size > _max) return false;
    return true;
  });
  if (!picked.length) { showToast('\u26a0\ufe0f Aucun fichier RF exploitable dans ce dossier'); return; }
  showToast('\u23f3 Lecture du projet\u2026');
  try {
    const entries = await Promise.all(picked.map(async f => {
      const rp = (f.webkitRelativePath || f.name);
      const relPath = rp.split('/').slice(1).join('/') || rp;
      const content = await f.text();
      return { relPath, content };
    }));
    if (!entries.filter(e => /\.(robot|resource)$/i.test(e.relPath)).length) {
      showToast('\u26a0\ufe0f Aucun .robot/.resource trouv\u00e9'); return;
    }
    _rfImportModal(title, _buildRFCard(entries));
  } catch (e) {
    showToast('\u26a0\ufe0f Import projet impossible : ' + e.message);
  }
}


// generateCodeFromCases is unified — generateCodeFromCard handles per-card logic

// ── Build RF prompt ────────────────────────────────────────────────────────────







// ══════════════════════════════════════════════════════════════════════════════
// RUN TESTS + REPORT
// ══════════════════════════════════════════════════════════════════════════════



// ══════════════════════════════════════════════════════════════════════════════
// i18n — Internationalisation
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// TEST SUITE MANAGER
// ══════════════════════════════════════════════════════════════════════════════



// ─────────────────────────────────────────────────────────────────────────────

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



// ══════════════════════════════════════════════════════════════════════════════
// PANEL ANALYSE — Filtres + Diff côte à côte
// ══════════════════════════════════════════════════════════════════════════════
function _apFilter(s) { const c=document.getElementById('analysisPanelContent'); if(c){c._filters={...(c._filters||{}),status:s};renderAnalysisPanel();} }
function _apSearch(v) { const c=document.getElementById('analysisPanelContent'); if(c){c._filters={...(c._filters||{}),search:v};_apRenderList(c);} }
function _apPage(p)   { const c=document.getElementById('analysisPanelContent'); if(c){c._filters={...(c._filters||{}),page:p};_apRenderList(c);} }
let _analysisPanelOpen = false;

if(!window._taggedCards) window._taggedCards = new Set();
function toggleCardTag(cardId) {
  if(!window._taggedCards) window._taggedCards=new Set();
  if(window._taggedCards.has(cardId)){window._taggedCards.delete(cardId);showToast('Retire du deploy');}
  else{window._taggedCards.add(cardId);showToast('Tague pour deploy');}
  var btn=document.getElementById('tagBtn-'+cardId);
  if(btn){var t=window._taggedCards.has(cardId);btn.style.borderColor=t?'#c084fc':'var(--border)';btn.style.color=t?'#c084fc':'var(--gray)';btn.textContent=t?'Tagged':'Tag';}
  var badge=document.getElementById('cicdBadge');
  if(badge) badge.textContent=window._taggedCards.size>0?' ('+window._taggedCards.size+')':'';
}
function getTaggedFiles(){
  if(!window._taggedCards) return [];
  var files=[];
  window._taggedCards.forEach(function(id){
    var card=(window._codeCards||[]).find(function(c){return c.cardId===id;});
    if(card&&card.files) card.files.forEach(function(f){if(f.filename&&f.code&&!f.filename.endsWith('.gitkeep')) files.push({path:f.filename,content:f.code});});
  });
  return files;
}
function _importRFFiles(files, source) {
  if (!files || !files.length) { showToast('Aucun fichier .robot trouve'); return; }
  // Normaliser les chemins : retirer le prefixe commun redondant
  var _allPaths = files.map(function(f){ return f.path; });
  var _commonPrefix = (function(){
    if (_allPaths.length === 0) return '';
    var parts = _allPaths[0].split('/');
    var prefix = [];
    for (var pi = 0; pi < parts.length - 1; pi++) {
      var seg = parts[pi];
      if (_allPaths.every(function(p){ return p.split('/')[pi] === seg; })) {
        prefix.push(seg);
      } else { break; }
    }
    return prefix.length ? prefix.join('/') + '/' : '';
  })();
  var rf = files.map(function(f){
    var cleanPath = _commonPrefix && f.path.startsWith(_commonPrefix)
      ? f.path.slice(_commonPrefix.length) : f.path;
    return { filename: cleanPath, code: f.content,
             label: cleanPath.split('/').pop().replace('.robot','') };
  });
  // Déduplication par source
  window._codeCards = window._codeCards || [];
  var existing = window._codeCards.find(function(card) {
    return card.source === source || card.title === source;
  });

  if (existing) {
    existing.files = rf;
    existing.title = source;
    existing.source = source;
    existing.tagged = true;
    var el = document.getElementById(existing.cardId);
    if (el) { el.remove(); renderResultCard(rf, existing.cardId); }
    // Restaurer tag visuel
    if (!window._taggedCards) window._taggedCards = new Set();
    window._taggedCards.add(existing.cardId);
    setTimeout(function(){
      var btn = document.getElementById('tagBtn-' + existing.cardId);
      if (btn) { btn.style.background='rgba(192,132,252,0.18)'; btn.style.color='#c084fc'; btn.style.borderColor='#c084fc'; btn.textContent='Tagged'; }
    }, 100);
    saveCodeCards();
    _savePulledBlock(existing.cardId, source, rf, true);
    showToast('Bloc mis à jour : ' + source);
    return;
  }

  // Nouveau bloc — ID stable basé sur la source
  var _b64 = '';
  try { _b64 = btoa(unescape(encodeURIComponent(source))).replace(/[^a-zA-Z0-9]/g,'').slice(0,16); } catch(e) { _b64 = Date.now().toString(36); }
  var stableId = 'pulled-' + _b64 + '-' + Date.now();

  renderResultCard(rf, stableId);

  // Brancher dans _codeCards pour persistance automatique via saveCodeCards
  window._codeCards.push({
    type:   'pulled',
    cardId: stableId,
    title:  source,
    source: source,
    files:  rf,
    tagged: true,
  });

  // Taguer automatiquement
  if (!window._taggedCards) window._taggedCards = new Set();
  window._taggedCards.add(stableId);
  setTimeout(function(){
    var btn = document.getElementById('tagBtn-' + stableId);
    if (btn) { btn.style.background='rgba(192,132,252,0.18)'; btn.style.color='#c084fc'; btn.style.borderColor='#c084fc'; btn.textContent='Tagged'; }
  }, 100);

  saveCodeCards();
  _savePulledBlock(stableId, source, rf, true);
  showToast(rf.length + ' fichiers importés : ' + source);
}
function openCICDPanel(){
  if(!window._taggedCards) window._taggedCards=new Set();
  var ov=document.getElementById('cicdPanelOverlay');
  if(ov){ov.style.display=ov.style.display==='none'?'flex':'none';if(ov.style.display!=='none')_renderCICDContent();return;}
  ov=document.createElement('div');ov.id='cicdPanelOverlay';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:800;display:flex;justify-content:flex-end;pointer-events:none';
  var panel=document.createElement('div');
  panel.style.cssText='width:560px;min-width:380px;max-width:95vw;height:100vh;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;pointer-events:all;box-shadow:-4px 0 24px rgba(0,0,0,0.4);position:relative;';
  var handle=document.createElement('div');handle.style.cssText='position:absolute;left:0;top:0;bottom:0;width:5px;cursor:ew-resize;z-index:10';
  handle.addEventListener('mousedown',function(e){e.preventDefault();var sx=e.clientX,sw=panel.offsetWidth;var onM=function(m){panel.style.width=Math.min(Math.max(sw+(sx-m.clientX),380),window.innerWidth*0.95)+'px';};var onU=function(){document.removeEventListener('mousemove',onM);document.removeEventListener('mouseup',onU);};document.addEventListener('mousemove',onM);document.addEventListener('mouseup',onU);});
  var hdr=document.createElement('div');hdr.style.cssText='display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--card);border-bottom:1px solid var(--border);flex-shrink:0';
  hdr.innerHTML='<span style="font-size:13px;font-weight:700;color:#c084fc;letter-spacing:1px">CI/CD DEPLOY</span>'
    +'<span id="cicdTagCount" style="font-size:11px;color:var(--gray);margin-left:6px"></span>'
    +'<button onclick="document.getElementById(\'cicdPanelOverlay\').style.display=\'none\'" style="background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer;margin-left:auto">&#x2715;</button>';
  var tabs=document.createElement('div');tabs.style.cssText='display:flex;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--card)';
  [['tagged','TAGUÉS'],['gitlab','GITLAB'],['azure','AZURE']].forEach(function(td,i){
    var b=document.createElement('button');b.id='cicdTab-'+td[0];b.textContent=td[1];
    b.style.cssText='flex:1;padding:10px;font-size:11px;font-family:monospace;cursor:pointer;border:none;border-bottom:2px solid '+(i===0?'#c084fc':'transparent')+';background:transparent;color:'+(i===0?'#c084fc':'var(--gray)');
    (function(t){b.onclick=function(){switchCICDTab(t);};})(td[0]);tabs.appendChild(b);
  });
  var content=document.createElement('div');content.id='cicdPanelContent';content.style.cssText='flex:1;overflow-y:auto;';content.dataset.tab='tagged';
  panel.appendChild(handle);panel.appendChild(hdr);panel.appendChild(tabs);panel.appendChild(content);
  ov.appendChild(panel);document.body.appendChild(ov);
  ov.addEventListener('click',function(e){if(e.target===ov)ov.style.display='none';});
  _renderCICDContent();
}
function switchCICDTab(tab){
  ['tagged','gitlab','azure'].forEach(function(t){var b=document.getElementById('cicdTab-'+t);if(b){b.style.borderBottomColor=t===tab?'#c084fc':'transparent';b.style.color=t===tab?'#c084fc':'var(--gray)';}});
  var c=document.getElementById('cicdPanelContent');if(c){c.dataset.tab=tab;_renderCICDContent();}
}
function _renderCICDContent(){
  var c=document.getElementById('cicdPanelContent');if(!c)return;
  var tab=c.dataset.tab||'tagged';
  var el=document.getElementById('cicdTagCount');
  if(el)el.textContent=window._taggedCards&&window._taggedCards.size>0?window._taggedCards.size+' tague(s)':'Aucun bloc tague';
  if(tab==='tagged')_cicdTaggedTab(c);else _cicdProviderTab(c,tab);
}
function _cicdTaggedTab(c){
  var tagged=[...(window._taggedCards||new Set())].map(function(id){return(window._codeCards||[]).find(function(x){return x.cardId===id;});}).filter(Boolean);
  if(!tagged.length){c.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray);font-size:12px">Clique sur <strong style="color:#c084fc">Tag</strong> sur un bloc de code</div>';return;}
  var h='<div style="padding:8px 14px;font-size:11px;color:var(--gray);border-bottom:1px solid var(--border)">'+tagged.length+' bloc(s) — '+getTaggedFiles().length+' fichier(s)</div>';
  tagged.forEach(function(card){
    var nbFiles=(card.files||[]).length;
    h+='<div style="border-bottom:1px solid var(--border);padding:10px 14px">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
      +'<span style="font-size:12px;font-weight:700;color:var(--teal);flex:1">'+escHtml(card.title||card.cardId)+'</span>'
      +'<span style="font-size:10px;color:var(--gray);margin-right:6px">('+nbFiles+' fichier(s))</span>'
      +'<button onclick="toggleCardTag(\''+card.cardId+'\');" style="background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.3);color:var(--red);padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer">Retirer</button>'
      +'</div>'
      +'<div style="display:flex;gap:4px;flex-wrap:wrap">'
      +(card.files||[]).map(function(f){return'<span style="font-size:13px;background:var(--card);border:1px solid var(--border);padding:4px 10px;border-radius:8px;color:var(--teal);font-family:monospace">'+escHtml(f.filename)+'</span>';}).join('')
      +'</div></div>';
  });
  h+='<div style="padding:12px;display:flex;gap:6px;border-top:1px solid var(--border)"><button onclick="switchCICDTab(\'gitlab\')" style="flex:1;padding:8px;font-size:11px;font-family:monospace;border-radius:6px;cursor:pointer;border:1px solid var(--border);background:rgba(192,132,252,0.08);color:#c084fc">GitLab</button><button onclick="switchCICDTab(\'azure\')" style="flex:1;padding:8px;font-size:11px;font-family:monospace;border-radius:6px;cursor:pointer;border:1px solid var(--border);background:rgba(0,120,212,0.08);color:#60a5fa">Azure</button></div>';
  c.innerHTML=h;
}
function _cicdInp(id,val,ph,pw){return'<input id="'+id+'" type="'+(pw?'password':'text')+'" value="'+escHtml(val||'')+'" placeholder="'+escHtml(ph||'')+'" style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:12px;font-family:monospace;color:var(--text);box-sizing:border-box"/>';}
function _cicdProviderTab(c,provider){
  var isGL=provider==='gitlab',color=isGL?'#c084fc':'#60a5fa',label=isGL?'GitLab':'Azure DevOps';
  var stored={};try{stored=JSON.parse(localStorage.getItem('cicd_'+provider)||'{}');}catch(e){}
  var files=getTaggedFiles();
  var fHtml=files.length?files.map(function(f){return'<div style="font-size:11px;color:var(--teal);font-family:monospace">'+escHtml(f.path)+'</div>';}).join(''):'<div style="font-size:11px;color:var(--red)">Aucun bloc tague</div>';
  c.innerHTML='<div style="padding:16px 14px"><div style="font-size:13px;font-weight:700;color:'+color+';margin-bottom:14px">'+label+'</div><div style="display:flex;flex-direction:column;gap:10px">'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">URL repo</label>'+_cicdInp(provider+'_url',stored.url,isGL?'https://gitlab.com/org/repo':'https://dev.azure.com/org/repo')+'</div>'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Token</label>'+_cicdInp(provider+'_token',stored.token,'token',true)+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Branche</label>'+_cicdInp(provider+'_branch',stored.branch||'main','main')+'</div>'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Nouvelle branche</label>'+_cicdInp(provider+'_newbranch',stored.newbranch,'feature/tests-rf')+'</div></div>'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Message commit</label>'+_cicdInp(provider+'_msg',stored.msg||'feat: ajout tests RF','feat: ...')+'</div>'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Dossier destination</label>'+_cicdInp(provider+'_folder',stored.folder||'tests/robot','tests/robot')+'</div>'
    +'</div><div style="margin-top:12px;padding:8px;background:var(--card);border-radius:6px;border:1px solid var(--border)"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">Fichiers ('+files.length+')</div>'+fHtml+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">'
    +'<button onclick="_cicdPush(&quot;'+provider+'&quot;)" style="padding:10px;background:rgba(192,132,252,0.12);border:1px solid '+color+';color:'+color+';border-radius:8px;font-size:12px;font-family:monospace;cursor:pointer;font-weight:700">Push</button>'
    +'<button onclick="_cicdPull(&quot;'+provider+'&quot;)" style="padding:10px;background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);border-radius:8px;font-size:12px;font-family:monospace;cursor:pointer;font-weight:700">Pull</button>'
    +'</div><div id="'+provider+'_status" style="margin-top:10px;font-size:12px;display:none"></div></div>';
}

async function _cicdPush(provider){
  var url=document.getElementById(provider+'_url')?.value?.trim(),token=document.getElementById(provider+'_token')?.value?.trim();
  var branch=document.getElementById(provider+'_branch')?.value?.trim()||'main',newBranch=document.getElementById(provider+'_newbranch')?.value?.trim()||'';
  var msg=document.getElementById(provider+'_msg')?.value?.trim()||'feat: tests RF',folder=document.getElementById(provider+'_folder')?.value?.trim()||'tests/robot';
  var statusEl=document.getElementById(provider+'_status'),files=getTaggedFiles();
  if(!url||!token){showToast('URL et token requis');return;}
  if(!files.length){showToast('Aucun bloc tagué');return;}
  localStorage.setItem('cicd_'+provider,JSON.stringify({url:url,token:token,branch:branch,newbranch:newBranch,msg:msg,folder:folder}));
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Analyse des changements...</span>';}

  // ── Étape 1 : git status (diff)
  var diffData = null;
  try {
    var diffRes = await fetch('http://localhost:3001/api/cicd/diff', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({provider,url,token,branch,folder,files})
    });
    diffData = await diffRes.json();
  } catch(e) {
    diffData = { ok: false };
  }

  // Si diff échoue, on pushe tout avec create/update fallback
  if (!diffData || !diffData.ok) {
    if(statusEl)statusEl.innerHTML='<span style="color:var(--warn)">Diff indisponible — push direct...</span>';
    await _cicdDoPush(provider,url,token,branch,newBranch,msg,folder,files,statusEl);
    return;
  }

  var added    = diffData.added    || [];
  var modified = diffData.modified || [];
  var unchanged= diffData.unchanged|| [];
  var deleted  = diffData.deleted  || [];
  var toPush   = files.filter(function(f){ return added.includes(f.path)||modified.includes(f.path); })
                      .map(function(f){ return {...f, status: modified.includes(f.path)?'modified':'added'}; });
  // Ajouter les fichiers à supprimer
  deleted.forEach(function(p){ toPush.push({path:p, content:'', status:'deleted'}); });

  if(!toPush.length){
    if(statusEl)statusEl.innerHTML='<span style="color:var(--gray)">Aucun changement à pusher</span>';
    showToast('Rien à pusher — tous les fichiers sont identiques');
    return;
  }

  // ── Étape 2 : afficher le dialog git status
  _showDiffDialog({added,modified,unchanged,deleted,toPush,provider,url,token,branch,newBranch,msg,folder,statusEl});
}

function _showDiffDialog({added,modified,unchanged,deleted,toPush,provider,url,token,branch,newBranch,msg,folder,statusEl}){
  deleted = deleted || [];
  document.getElementById('_diffDialog')?.remove();
  var d = document.createElement('div');
  d.id = '_diffDialog';
  d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';

  var rows = '';
  added.forEach(function(p){ rows+='<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;font-family:monospace"><span style="color:#22c55e;width:80px;flex-shrink:0">● added</span><span style="color:var(--text)">'+escHtml(p)+'</span></div>'; });
  modified.forEach(function(p){ rows+='<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;font-family:monospace"><span style="color:#f59e0b;width:80px;flex-shrink:0">● modified</span><span style="color:var(--text)">'+escHtml(p)+'</span></div>'; });
  deleted.forEach(function(p){ rows+='<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;font-family:monospace"><span style="color:#ef4444;width:80px;flex-shrink:0">✕ deleted</span><span style="color:#ef4444;text-decoration:line-through">'+escHtml(p)+'</span></div>'; });
  unchanged.forEach(function(p){ rows+='<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;font-family:monospace"><span style="color:var(--gray);width:80px;flex-shrink:0">○ unchanged</span><span style="color:var(--gray)">'+escHtml(p)+'</span></div>'; });

  d.innerHTML='<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:480px;overflow:hidden">'
    +'<div style="padding:12px 18px;background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">'
    +'<span style="font-size:13px;font-weight:700;color:var(--teal)">📋 Git Status</span>'
    +'<span style="font-size:11px;color:var(--gray);margin-left:auto">'+toPush.length+' fichier(s) à pusher</span>'
    +'</div>'
    +'<div style="padding:14px 18px;max-height:320px;overflow-y:auto">'+rows+'</div>'
    +'<div style="padding:12px 18px;background:var(--card);border-top:1px solid var(--border);display:flex;gap:8px">'
    +'<button id="_diffConfirm" style="flex:1;padding:9px;background:rgba(192,132,252,0.12);border:1px solid #c084fc;color:#c084fc;border-radius:8px;font-size:12px;font-family:monospace;cursor:pointer;font-weight:700">🚀 Push ('+toPush.length+')</button>'
    +'<button id="_diffCancel" style="padding:9px 16px;background:transparent;border:1px solid var(--border);color:var(--gray);border-radius:8px;font-size:12px;font-family:monospace;cursor:pointer">Annuler</button>'
    +'</div>'
    +'</div>';

  document.body.appendChild(d);
  document.getElementById('_diffCancel').onclick=function(){ d.remove(); if(statusEl)statusEl.innerHTML=''; };
  document.getElementById('_diffConfirm').onclick=async function(){
    d.remove();
    await _cicdDoPush(provider,url,token,branch,newBranch,msg,folder,toPush,statusEl);
  };
}

async function _cicdDoPush(provider,url,token,branch,newBranch,msg,folder,files,statusEl){
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Push en cours...</span>';}
  try{
    var res=await fetch('http://localhost:3001/api/cicd/push',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({provider,url,token,branch,newBranch,msg,folder,files})});
    var data=await res.json();
    if(data.ok){if(statusEl)statusEl.innerHTML='<span style="color:#22c55e">✅ Push réussi !</span>';showToast('Code pushé sur '+provider);}
    else{if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">Erreur: '+escHtml(data.error||'inconnue')+'</span>';}
  }catch(e){if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml(e.message)+'</span>';}
}
async function _cicdPull(provider){
  var url=document.getElementById(provider+'_url')?.value?.trim(),token=document.getElementById(provider+'_token')?.value?.trim();
  var branch=document.getElementById(provider+'_branch')?.value?.trim()||'main',folder=document.getElementById(provider+'_folder')?.value?.trim()||'';
  var statusEl=document.getElementById(provider+'_status');
  if(!url||!token){showToast('URL et token requis');return;}
  // Sauvegarder token + url au Pull
  var _stored={};try{_stored=JSON.parse(localStorage.getItem('cicd_'+provider)||'{}');}catch(e){}
  localStorage.setItem('cicd_'+provider,JSON.stringify({..._stored,url:url,token:token,branch:branch,folder:folder}));
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Recuperation...</span>';}
  try{var res=await fetch('http://localhost:3001/api/cicd/pull',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider:provider,url:url,token:token,branch:branch,folder:folder})});var data=await res.json();
  if(data.ok&&data.files&&data.files.length){
    var _repoName=(function(){try{var u=document.getElementById(provider+'_url')?.value?.trim()||'';return u.replace(/\/$/,'').split('/').pop()||provider;}catch(e){return provider;}})();
    var _source=_repoName+' ('+provider+'/'+branch+')';
    _importRFFiles(data.files,_source);if(statusEl)statusEl.innerHTML='<span style="color:#22c55e">'+data.files.length+' fichier(s)</span>';showToast(data.files.length+' fichiers importes');}
  else{if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml((data&&data.error)||'Aucun .robot')+'</span>';}}
  catch(e){if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml(e.message)+'</span>';}
}
async function _cicdJenkinsTrigger(){
  showToast('Jenkins supprimé — utilise GitLab ou Azure');
  return;
  var url='',job='',user='',token='',params='';
  var statusEl=null;
  if(!url||!job||!token){showToast('URL, job et token requis');return;}
  localStorage.setItem('cicd_jenkins',JSON.stringify({url:url,job:job,user:user,token:token,params:params}));
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Declenchement...</span>';}
  try{var res=await fetch('http://localhost:3001/api/cicd/jenkins',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,job:job,user:user,token:token,params:params})});var data=await res.json();
  if(data.ok){if(statusEl)statusEl.innerHTML='<span style="color:#22c55e">Pipeline declenche!</span>';showToast('Jenkins declenche');}
  else{if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml((data&&data.error)||'Erreur')+'</span>';}}
  catch(e){if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml(e.message)+'</span>';}
}
async function _cicdJenkinsPull(){
  showToast('Jenkins supprimé — utilise GitLab ou Azure');
  return;
  var url='',job='',user='',token='',build='';
  var statusEl=null;
  if(!url||!job||!token){showToast('URL, job et token requis');return;}
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Pull artifacts...</span>';}
  try{var res=await fetch('http://localhost:3001/api/cicd/jenkins-artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,job:job,user:user,token:token,buildNumber:build})});var data=await res.json();
  if(data.ok&&data.files&&data.files.length){_importRFFiles(data.files,'Jenkins #'+(data.buildNumber||'?'));if(statusEl)statusEl.innerHTML='<span style="color:#22c55e">'+data.files.length+' artifact(s)</span>';showToast(data.files.length+' artifacts');}
  else{if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml((data&&data.error)||'Aucun artifact')+'</span>';}}
  catch(e){if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml(e.message)+'</span>';}
}

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
    <span style="font-size:12px;font-weight:700;color:var(--teal);letter-spacing:1px">🔍 ANALYSE</span>
    <button onclick="document.getElementById('analysisPanelOverlay').style.display='none';_analysisPanelOpen=false;"
      style="background:transparent;border:none;color:var(--gray);font-size:16px;cursor:pointer;margin-left:auto">✕</button>
  `;

  // Tabs
  const tabs = document.createElement('div');
  tabs.style.cssText = 'display:flex;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--card)';
  tabs.innerHTML = `
    <button id="aTabFilter" onclick="switchAnalysisTab('filter')"
      style="flex:1;padding:10px;font-size:13px;font-family:monospace;cursor:pointer;border:none;border-bottom:2px solid var(--teal);background:transparent;color:var(--teal)">
      🔎 FILTRES
    </button>
    <button id="aTabDiff" onclick="switchAnalysisTab('diff')"
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

  let html = `<div style="padding:6px 14px;font-size:12px;color:var(--gray);letter-spacing:1px;border-bottom:1px solid var(--border)">${filtered.length} résultat${filtered.length>1?'s':''}</div>`;

  if (filtered.length === 0) {
    html += '<div style="padding:32px;text-align:center;font-size:12px;color:var(--gray)">Aucun résultat</div>';
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
            <span style="font-size:11px;color:var(--gray);margin-left:6px">${tests.length} TC</span>
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
  btnRow.appendChild(activeBtn('all',  'TOUS',   all.length, 'var(--teal)'));
  btnRow.appendChild(activeBtn('pass', '✓ PASS', pass,       '#22c55e'));
  btnRow.appendChild(activeBtn('fail', '✗ FAIL', fail,       '#DC2626'));
  btnRow.appendChild(activeBtn('skip', '⏭ SKIP', skip,       '#f59e0b'));

  const searchInput = document.createElement('input');
  searchInput.id = 'apSearch';
  searchInput.type = 'text';
  searchInput.placeholder = '🔍 Rechercher...';
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
      pb.textContent = p === 'all' ? 'Toutes' : p;
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
          <div style="font-size:12px;color:var(--gray);margin-bottom:4px;letter-spacing:1px">RUN A</div>
          <select id="diffSelA" onchange="document.getElementById('analysisPanelContent')._diffSel.a=this.value;renderAnalysisPanel()"
            style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:12px;font-family:monospace;color:var(--text)">
            <option value="">— Sélectionner —</option>${runOptions}
          </select>
        </div>
        <div>
          <div style="font-size:12px;color:var(--gray);margin-bottom:4px;letter-spacing:1px">RUN B</div>
          <select id="diffSelB" onchange="document.getElementById('analysisPanelContent')._diffSel.b=this.value;renderAnalysisPanel()"
            style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:12px;font-family:monospace;color:var(--text)">
            <option value="">— Sélectionner —</option>${runOptions}
          </select>
        </div>
      </div>
    </div>
  `;

  if (!sel.a || !sel.b) {
    html += '<div style="padding:32px;text-align:center;font-size:12px;color:var(--gray)">Sélectionne deux runs pour les comparer</div>';
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
    <div style="padding:6px 14px;font-size:12px;color:var(--gray);letter-spacing:1px;border-bottom:1px solid var(--border)">${allNames.length} test(s)</div>
  `;

  allNames.forEach(name => {
    const tA = testsA.find(t=>t.name===name);
    const tB = testsB.find(t=>t.name===name);
    const sA = (tA?.status||'missing').toLowerCase();
    const sB = (tB?.status||'missing').toLowerCase();
    const changed = sA !== sB;

    const statusCell = (s, msg) => {
      const color = s==='pass'?'#22c55e':s==='fail'?'#DC2626':s==='skip'?'#f59e0b':'var(--gray)';
      const bg    = s==='pass'?'rgba(34,197,94,0.10)':s==='fail'?'rgba(220,38,38,0.10)':s==='skip'?'rgba(245,158,11,0.10)':'transparent';
      const icon  = s==='pass'?'✓':s==='fail'?'✗':s==='skip'?'⏭':'—';
      return `<div style="padding:8px 10px;border-right:1px solid var(--border);background:${bg}">
        <span style="font-size:15px;color:${color};font-weight:700">${icon}</span>
        <span style="font-size:12px;color:${color};margin-left:5px;text-transform:uppercase;font-weight:600">${s}</span>
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
