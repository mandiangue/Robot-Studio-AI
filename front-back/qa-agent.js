





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

  const reportHtml = buildInlineReport(data);
  const blob    = new Blob([reportHtml], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  const date    = new Date().toISOString().slice(0,10);

  const runNum = data.runNumber || Date.now();
  data.runNumber = runNum; // ensure runNumber is always set
  // cardId stable basé uniquement sur runNumber — même rapport = même cardId
  const cardId = 'reportCard-' + runNum;
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
            🧪 SUITE : ${escHtml(data.suiteName||'')}
          </span>${(() => {
            const names = data.blockNames||[];
            const max = 3;
            const visible = names.slice(0, max);
            const rest = names.slice(max);
            const badges = visible.map(n => `<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(0,212,170,0.12);color:var(--teal);border:1px solid rgba(0,212,170,0.3);padding:3px 10px;border-radius:10px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis" title="${escHtml(n)}">${escHtml(n)}</span>`).join('');
            const more = rest.length ? `<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(168,85,247,0.12);color:#c084fc;border:1px solid rgba(168,85,247,0.3);padding:3px 10px;border-radius:10px;white-space:nowrap;cursor:default" title="${escHtml(rest.join(', '))}">+${rest.length} autres</span>` : '';
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
            ${data.status==='PASS'?'✅':'❌'} ${data.passed}/${data.total} réussis
          </span>
          ${data.failed > 0 ? `<button onclick="scrollToFailed('${cardId}')"
            style="background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.3);color:#DC2626;padding:4px 12px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
            ❌ ${data.failed} échec${data.failed>1?'s':''}
          </button>` : ''}
          <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center">

            ${data.logUrl ? `<a href="${data.logUrl}" target="_blank"
              style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:4px 12px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;text-decoration:none;display:inline-flex;align-items:center;gap:4px">
              📋 Log RF
            </a>` : ''}
            <button onclick="openRunHistory()"
              style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:4px 12px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
              📜 Historique (${_reportHistory.length})
            </button>
            <a href="${blobUrl}" download="rapport_tests_${date}.html"
              style="background:rgba(245,158,11,0.08);border:1px solid var(--warn);color:var(--warn);padding:4px 12px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;text-decoration:none">
              ⬇️ Télécharger
            </a>
            <button onclick="deleteReportCard('${cardId}', ${runNum})"
              style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);color:var(--red);
                     padding:4px 10px;border-radius:5px;font-size:13px;cursor:pointer"
              title="Supprimer ce rapport">✕</button>
          </div>
        </div>

        <!-- Iframe report -->
        <iframe src="${blobUrl}" style="width:100%;height:580px;border:none;display:block"></iframe>
      </div>
    </div>`;

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
  const rate    = data.total > 0 ? Math.round(data.passed / data.total * 100) : 0;
  const now     = new Date();
  const dateStr = now.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  const timeStr = now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  const title   = data.reportTitle || (data.isSuite ? 'Suite : ' + (data.suiteName||'') : 'Rapport de Tests Automatisés');
  const comment = data.comment || '';

  const testsHtml = data.tests.map((t, i) => {
    const icon     = t.status==='PASS'?'✅':t.status==='FAIL'?'❌':t.status==='SKIP'?'⏭️':'✅';
    const iconEn   = t.status==='PASS'?'PASSED':t.status==='FAIL'?'FAILED':t.status==='SKIP'?'SKIPPED':'PASSED';
    const color    = t.status==='PASS'?'#22c55e':t.status==='FAIL'?'#DC2626':t.status==='SKIP'?'#f59e0b':'#22c55e';
    const tags     = (t.tags||[]).map(tg=>`<span style="background:rgba(0,212,170,0.12);color:#00d4aa;border:1px solid rgba(0,212,170,0.25);padding:2px 8px;border-radius:10px;font-size:10px;font-family:monospace;margin:0 2px">${esc(tg)}</span>`).join('');

    const stepsHtml = (t.steps||[]).map(s => {
      const sColor = s.status==='PASS'?'#22c55e':s.status==='FAIL'?'#DC2626':s.status==='INFO'?'#60a5fa':'#94afc8';
      const sIcon  = s.status==='PASS'?'✓':s.status==='FAIL'?'✗':s.status==='INFO'?'ℹ':'○';
      const screenshot = s.screenshot ? `
        <div style="margin:8px 0">
          <div style="font-size:10px;color:#60a5fa;font-family:monospace;margin-bottom:4px">📸 SCREENSHOT</div>
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
        <div style="font-size:11px;font-family:monospace;color:#DC2626;letter-spacing:1px;margin-bottom:8px;font-weight:700">🔎 ANALYSE DE L'ÉCHEC / FAILURE ANALYSIS</div>
        <div style="font-size:13px;color:#fca5a5;margin-bottom:10px;line-height:1.65">${esc(t.failureAnalysis||'')}</div>
        ${t.message?`<div style="background:#060c14;border-radius:6px;padding:10px 12px;font-family:monospace;font-size:12px;color:#fca5a5;white-space:pre-wrap;word-break:break-all;margin-bottom:10px;border:1px solid rgba(220,38,38,0.15)">${esc(t.message)}</div>`:''}
        ${t.suggestion?`<div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:6px;padding:12px;font-size:13px;color:#fcd34d;line-height:1.65">
          <div style="font-size:10px;font-family:monospace;color:#f59e0b;margin-bottom:4px;letter-spacing:1px">💡 SOLUTION SUGGÉRÉE / SUGGESTED FIX</div>
          ${esc(t.suggestion)}</div>`:''}
        ${failScreenshot?`<div style="margin-top:12px"><div style="font-size:10px;font-family:monospace;color:#60a5fa;letter-spacing:1px;margin-bottom:6px">📸 CAPTURE D'ÉCRAN / SCREENSHOT</div>
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
            <div style="font-size:10px;color:#94afc8;font-family:monospace;letter-spacing:1px;margin:12px 0 6px">ÉTAPES D'EXÉCUTION / EXECUTION STEPS</div>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="border-bottom:1px solid #1c2a38">
                  <th style="padding:4px 8px;font-size:10px;color:#94afc8;font-family:monospace;text-align:left">ST</th>
                  <th style="padding:4px 8px;font-size:10px;color:#94afc8;font-family:monospace;text-align:left">STEP</th>
                  <th style="padding:4px 8px;font-size:10px;color:#94afc8;font-family:monospace;text-align:left">DURÉE</th>
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
          Généré le / Generated on: ${dateStr} à ${timeStr}<br>
          Environnement / Environment: RoboTest·AI — Robot Framework
        </div>
      </div>
      <span class="badge ${rate===100?'badge-pass':'badge-fail'}">${rate===100?'✅ ALL PASS':`❌ ${data.failed} FAILED`}</span>
    </div>
  </div>

  <!-- Print button -->
  <div class="no-print" style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">
    <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Print</button>
    ${data.logUrl ? `<a href="${data.logUrl}" target="_blank" class="print-btn no-print" style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#c084fc;text-decoration:none">📋 Log Robot Framework</a>` : ''}
    <button class="print-btn" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.3);color:#22c55e" onclick="document.querySelectorAll('[id^=tb]').forEach(e=>e.style.display='block')">▼ Tout déplier / Expand all</button>
    <button class="print-btn" style="background:transparent;border-color:#1c2a38;color:#94afc8" onclick="document.querySelectorAll('[id^=tb]').forEach(e=>e.style.display='none')">▲ Tout replier / Collapse all</button>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="stat s-total"><div class="stat-n" style="color:#00d4aa">${data.total}</div><div class="stat-l">TOTAL</div></div>
    <div class="stat s-pass"><div class="stat-n" style="color:#22c55e">${data.passed}</div><div class="stat-l">RÉUSSIS / PASSED</div></div>
    <div class="stat s-fail"><div class="stat-n" style="color:#DC2626">${data.failed}</div><div class="stat-l">ÉCHOUÉS / FAILED</div></div>
    ${data.skipped>0?`<div class="stat s-dur"><div class="stat-n" style="color:#f59e0b">${data.skipped}</div><div class="stat-l">IGNORÉS / SKIPPED</div></div>`:''}
    <div class="stat s-dur"><div class="stat-n" style="color:#94afc8;font-size:24px">${rate}%</div><div class="stat-l">TAUX / RATE</div></div>
    <div class="stat s-dur"><div class="stat-n" style="color:#94afc8;font-size:22px">${fmtD(data.duration)}</div><div class="stat-l">DURÉE TOTALE / TOTAL</div></div>
  </div>

  <!-- Progress bar -->
  <div class="prog">
    <div style="width:${data.total?data.passed/data.total*100:0}%;background:#22c55e;transition:width .5s"></div>
    <div style="width:${data.total?data.failed/data.total*100:0}%;background:#DC2626"></div>
  </div>

  <!-- Comment -->
  ${comment?`<div class="comment-box"><span style="font-size:10px;font-family:monospace;color:#00d4aa;display:block;margin-bottom:4px">💬 COMMENTAIRE TEST MANAGER</span>${esc(comment)}</div>`:''}

  <!-- Tests -->
  <div class="section-title">📋 DÉTAIL DES CAS DE TESTS / TEST CASES DETAIL</div>
  ${testsHtml}

  <!-- Footer -->
  <div class="footer">
    <span>RoboTest·AI — Rapport bilingue FR/EN</span>
    <span>Généré le ${dateStr} ${timeStr}</span>
    <span>Robot Framework + SeleniumLibrary</span>
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

// ══════════════════════════════════════════════════════════════════════════════
// i18n — Internationalisation
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// TEST SUITE MANAGER
// ══════════════════════════════════════════════════════════════════════════════

// Suite registry — { id, name, filename, code }
let suiteRegistry  = [];
let suiteSchedules = []; // { id, suiteName, tests[], type, datetime, interval, unit, active, nextRun }
let scheduleTimers = {};

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
  showToast('🧪 ' + id + ' ajouté à la suite');
}

function saveSuiteRegistry() {
  // Sauvegarde aussi dans MongoDB via saveSuitesList
  fetch('http://localhost:3001/api/storage/suites', {
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
  if (selected.length === 0) { showToast('⚠️ Sélectionne au moins un test'); return; }

  const titleEl = document.getElementById('suiteTitleInput') || document.getElementById('suiteNameInput');
  const suiteName = (titleEl?.value || '').trim() || 'Suite sans nom';
  try { localStorage.setItem('qa_suite_title', suiteName); } catch(e) {}
  const combined  = selected.map(t => t.code).join('\n\n');
  const filename  = 'suite_' + suiteName.replace(/\s+/g,'_').toLowerCase();

  showTyping();
  renderAgentMsg(`🧪 Lancement de la suite **${suiteName}** — ${selected.length} test(s)…`);

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
      <span class="sched-badge ${s.active ? 'active' : 'pending'}">${s.active ? '● Actif' : '○ Inactif'}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:var(--text);font-weight:600">${escHtml(s.suiteName)}</div>
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace">
          ${s.type === 'once' ? '📅 ' + new Date(s.datetime).toLocaleString('fr-FR') : '🔁 Toutes les ' + s.interval + ' ' + s.unit}
          · Prochain : ${s.nextRun ? new Date(s.nextRun).toLocaleString('fr-FR') : '—'}
        </div>
      </div>
      <button onclick="toggleSchedule(${i})"
        style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:4px 8px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
        ${s.active ? '⏸ Pause' : '▶️ Activer'}
      </button>
      <button onclick="stopTestRun();deleteSchedule(${i})"
        style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);color:var(--red);padding:4px 8px;border-radius:5px;font-size:10px;cursor:pointer" title="Stopper le run en cours">⏹ Stop</button>
      <button onclick="deleteSchedule(${i})"
        style="background:transparent;border:1px solid rgba(230,57,70,0.3);color:var(--red);padding:4px 8px;border-radius:5px;font-size:10px;cursor:pointer" title="Supprimer">✕</button>
    </div>`).join('') || '<div style="padding:16px;text-align:center;color:var(--gray);font-size:12px;font-style:italic">Aucun scheduling configuré</div>';

  const modal = document.createElement('div');
  modal.id = 'schedulerModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `<style>#schedDatetime::-webkit-calendar-picker-indicator{display:none!important}</style>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:580px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column">

      <!-- Header -->
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">⏰ Scheduler de suites</span>
        <button onclick="document.getElementById('schedulerModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer" title="Fermer">✕</button>
      </div>

      <!-- New schedule form -->
      <div style="padding:16px 20px;border-bottom:1px solid var(--border)">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:10px">
          NOUVEAU SCHEDULING
        </div>
        <!-- Suite selector -->
        <div style="margin-bottom:12px">
          <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:6px">SUITE(S) À PROGRAMMER</div>
          <div style="display:flex;flex-direction:column;gap:4px;max-height:120px;overflow-y:auto">
            ${savedSuites.length === 0
              ? '<div style="font-size:12px;color:var(--gray);font-style:italic">Aucune suite — crée une suite d\'abord</div>'
              : savedSuites.map(s => `<label style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--card);border:1px solid var(--border);border-radius:6px;cursor:pointer">
                  <input type="checkbox" class="sched-suite-cb" value="${s.id}" ${suiteIds.includes(s.id) ? 'checked' : ''} style="accent-color:var(--teal);width:13px;height:13px" />
                  <span style="font-size:12px;color:var(--text);font-weight:600">${escHtml(s.title)}</span>
                  <span style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace">${s.testIds.length} test(s)</span>
                </label>`).join('')
            }
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-bottom:12px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--teal);
                        background:rgba(0,212,170,0.08);border:1px solid var(--teal);padding:6px 14px;border-radius:6px">
            <input type="radio" name="schedType" value="once" checked style="accent-color:var(--teal)"> 🔂 Une fois
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--gray);
                        background:var(--card);border:1px solid var(--border);padding:6px 14px;border-radius:6px">
            <input type="radio" name="schedType" value="repeat" style="accent-color:var(--teal)"> 🔁 Répétition
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
              title="Choisir la date">📅</span>
          </div>
        </div>

        <div id="schedRepeatFields" style="display:none;display:flex;gap:8px;align-items:center">
          <span style="font-size:13px;color:var(--text)">Toutes les</span>
          <input type="number" id="schedInterval" value="1" min="1"
            style="background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);
                   padding:7px 10px;font-size:13px;font-family:'IBM Plex Mono',monospace;outline:none;width:70px"/>
          <select id="schedUnit"
            style="background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);
                   padding:7px 10px;font-size:13px;font-family:'IBM Plex Mono',monospace;outline:none">
            <option value="minutes">minutes</option>
            <option value="heures" selected>heures</option>
            <option value="jours">jours</option>
          </select>
        </div>

        <button id="schedSubmitBtn"
          style="margin-top:12px;width:100%;background:linear-gradient(135deg,#a855f7,#7c3aed);border:none;color:#fff;
                 padding:10px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          ⏰ Programmer ce scheduling
        </button>
      </div>

      <!-- Existing schedules -->
      <div style="overflow-y:auto;padding:0 20px;flex:1">
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;padding:12px 0 6px">
          SCHEDULINGS ACTIFS
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

  if (chosenSuites.length === 0) { showToast('⚠️ Coche au moins une suite'); return; }
  if (tests.length === 0) { showToast('⚠️ Les suites selectionnees n\'ont pas de tests'); return; }

  let schedule = { id: 'SC' + Date.now(), suiteName, suiteIds: chosenSuites.map(s => s.id), testIds, type, active: true };

  if (type === 'once') {
    const dtInput = document.getElementById('schedDatetime');
    const dt = dtInput?._isoValue || dtInput?.value;
    if (!dt) { showToast('⚠️ Choisis une date/heure'); return; }
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
  showToast(`⏰ Scheduling programmé — ${suiteName}`);
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
    showToast(`⏰ Scheduling déclenché : ${s.suiteName}`);
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
  if (!panel) { showToast('Panneau introuvable — recharge la page'); return; }

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
    showToast('⚠️ Ce bloc est déjà dans la suite'); return;
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
  showToast('✅ ' + title + ' ajouté à la suite');
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
    const r = await fetch('http://localhost:3001/api/storage/suites');
    const d = await r.json();
    if (d.ok) {
      if (d.savedSuites?.length > 0) savedSuites = d.savedSuites;
      if (d.registry?.length > 0) suiteRegistry = d.registry;
    }
  } catch(e) { console.warn('loadSuitesFromDB error:', e.message); }
}

function saveSuitesList() {
  try { localStorage.setItem('qa_named_suites', JSON.stringify(savedSuites)); } catch(e) {}
  fetch('http://localhost:3001/api/storage/suites', {
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
  if (testIds.length === 0) { showToast('Coche au moins un test'); return; }

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
  showToast('Suite "' + title + '" sauvegardee (' + testIds.length + ' tests)');
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
  showToast('Suite "' + suite.title + '" chargee');
}

function deleteNamedSuite(suiteId) {
  savedSuites = savedSuites.filter(s => s.id !== suiteId);
  saveSuitesList();
  renderSavedSuites();
  showToast('Suite supprimee');
}

function renderSavedSuites() {
  const el = document.getElementById('savedSuitesList');
  if (!el) return;

  let html = '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">';
  html += '<button onclick="addNewSuiteGroup()" style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);padding:7px 14px;border-radius:6px;font-size:11px;font-family:monospace;cursor:pointer;font-weight:600">+ Nouvelle suite</button>';
  html += '<button onclick="runCheckedSuiteGroups()" style="background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#07090f;padding:7px 14px;border-radius:6px;font-size:11px;font-family:monospace;cursor:pointer;font-weight:700">▶️ Run suite</button>';
  html += '</div>';

  if (savedSuites.length === 0) {
    html += '<div style="font-size:11px;color:var(--gray);font-style:italic;padding:8px 4px;text-align:center">Aucune suite — clique "+ Nouvelle suite"</div>';
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
          <span style="color:var(--gray);cursor:grab;font-size:14px;flex-shrink:0" title="Réordonner">⠿</span>
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
            title="${isEnabled?'Désactiver':'Activer'}">${isEnabled?'✅':'⬜'}</button>
          <button onclick="removeTestFromSuite(${si},'${t.id}')"
            style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:11px;padding:1px 4px"
            onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray)'" title="Retirer">✕</button>
        </div>
        <div id="${expandId}" style="display:none;padding:6px 10px 8px 36px;background:rgba(0,0,0,0.2);border-top:1px solid var(--border)">
          ${codePreview || '<div style="font-size:10px;color:var(--gray);font-style:italic">Pas de code disponible</div>'}
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
            ${suiteTests.length} test${suiteTests.length > 1 ? 's' : ''}
          </span>
          <button onclick="runSuiteGroup(${si})" id="runBtn-${s.id}"
            title="Lancer la suite"
            style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:#22c55e;
                   padding:4px 10px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">▶️</button>
          <button onclick="stopSuiteGroup('${s.id}')" id="stopBtn-${s.id}"
            title="Arrêter la suite"
            style="display:none;background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.3);color:var(--red);
                   padding:4px 10px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">⏹</button>
          <select onchange="setSuiteHeadless('${s.id}',this.value)" onclick="event.stopPropagation()"
            style="font-size:10px;background:var(--card);border:1px solid var(--border);color:var(--gray);border-radius:4px;padding:2px 4px;cursor:pointer"
            title="Mode navigateur pour cette suite">
            <option value="visible" ${(s.headless||'visible')==='visible'?'selected':''}>🖥️</option>
            <option value="headless" ${s.headless==='headless'?'selected':''}>🔇 Headless</option>
          </select>
          <button onclick="deleteSuiteGroup(${si})"
            style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:12px;padding:2px 4px;border-radius:3px"
            onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray)'"
            title="Supprimer la suite">✕</button>
        </div>

        <!-- Tests list -->
        ${testsHtml || '<div id="dropZone-'+s.id+'" style="padding:14px 20px;font-size:11px;color:var(--gray);font-style:italic;border:2px dashed var(--border);border-radius:8px;margin:8px;text-align:center;transition:all .2s" ondragover="event.preventDefault();this.style.borderColor=\'var(--teal)\';this.style.background=\'rgba(0,212,170,0.05)\'" ondragleave="this.style.borderColor=\'var(--border)\';this.style.background=\'\'" ondrop="dropCardToSuite(event,\''+s.id+'\')">📥 Glisse un bloc de code ici</div>'}

        <!-- Add test to suite -->
        ${addOptions ? `<div style="display:flex;gap:6px;padding:8px 12px;border-top:1px solid var(--border);background:rgba(0,0,0,0.1)">
          <select id="addTestSelect_${si}" onclick="event.stopPropagation()"
            style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);
                   padding:5px 8px;font-size:11px;font-family:'IBM Plex Mono',monospace;outline:none">
            <option value="">— Sélectionner un test —</option>
            ${addOptions}
          </select>
          <button onclick="addTestToSuite(${si})"
            style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.3);color:var(--teal);
                   padding:5px 12px;border-radius:6px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
            + Ajouter
          </button>
        </div>` : '<div style="padding:6px 12px;font-size:10px;color:var(--gray);font-style:italic;border-top:1px solid var(--border)">Tous les tests sont dans cette suite</div>'}

      </div>`;
  }).join('');

  el.innerHTML = html;
}

// ── Suite group management ────────────────────────────────────────────────────
function addNewSuiteGroup() {
  cleanSuiteRegistry(); // nettoie avant d'afficher
  const cards = (window._codeCards||[]).filter(c => c.type !== 'report' && c.type !== 'suite-report' && c.cardId);
  if (cards.length === 0) {
    showToast('⚠️ Génère d\'abord du code RF avant de créer une suite');
    return;
  }

  // Show picker modal to select code cards for this suite
  document.getElementById('_suitePickerModal')?.remove();
  const modal = document.createElement('div');
  modal.id = '_suitePickerModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';

  const _fmtDate = (cardId, card) => { let ts=null; const m=String(cardId||'').match(/(\d{10,})/); if(m) ts=parseInt(m[1]); if((!ts||isNaN(ts))&&card&&card.createdAt) ts=new Date(card.createdAt).getTime(); if(!ts||isNaN(ts)) return ''; try { return new Date(ts).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',',''); } catch(e){ return ''; } };
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
        <div style="font-size:11px;color:var(--gray)">${fileCount} fichier(s)${dateStr ? ' \u00b7 \ud83d\udd5b ' + dateStr : ''}</div>
      </div>
      <span onclick="event.preventDefault();event.stopPropagation();this.closest('label').remove()" title="Retirer de la liste" style="cursor:pointer;color:var(--gray);font-size:16px;padding:2px 8px;border-radius:5px;flex-shrink:0" onmouseover="this.style.color='#ff5c5c'" onmouseout="this.style.color='var(--gray)'">\u2715</span>
    </label>`;
  }).join('');

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:480px">
      <div style="display:flex;align-items:center;padding:16px 20px;background:var(--card);border-bottom:1px solid var(--border)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">🧪 Créer une suite</span>
        <button onclick="document.getElementById('_suitePickerModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="padding:14px 20px">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:12px">
          SÉLECTIONNE LES BLOCS À INCLURE
        </div>
        <div style="max-height:320px;overflow-y:auto">${rows}</div>
      </div>
      <div style="display:flex;gap:10px;padding:14px 20px;border-top:1px solid var(--border);background:var(--card)">
        <button id="_suitePickerCreate"
          style="flex:1;background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;
                 padding:10px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          ✅ Créer la suite
        </button>
        <button onclick="document.getElementById('_suitePickerModal').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:10px 16px;
                 border-radius:8px;font-size:13px;cursor:pointer">
          Annuler
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  document.getElementById('_suitePickerCreate').onclick = () => {
    const checked = [...document.querySelectorAll('.suite-picker-cb:checked')];
    if (checked.length === 0) { showToast('⚠️ Sélectionne au moins un bloc'); return; }

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
    showToast('🧪 Suite créée avec ' + checked.length + ' bloc(s)');
  };
}

function updateSuiteGroupTitle(idx, val) {
  if (savedSuites[idx]) { savedSuites[idx].title = val; savedSuites[idx].updatedAt = new Date().toISOString(); saveSuitesList(); }
}

function deleteSuiteGroup(idx) {
  const suite = savedSuites[idx];
  if (!suite) return;
  showConfirmDialog('🗑 Supprimer la suite', 'Supprimer la suite <b>' + escHtml(suite.title) + '</b> ?', () => {
    savedSuites.splice(idx, 1);
    saveSuitesList();
    // Supprimer aussi les suite-reports liés dans MongoDB
    const relatedCards = (window._codeCards||[]).filter(c => c.type === 'suite-report' && c.suiteTitle === suite.title);
    relatedCards.forEach(c => deleteFromDB(c.cardId));
    window._codeCards = (window._codeCards||[]).filter(c => !(c.type === 'suite-report' && c.suiteTitle === suite.title));
    saveCodeCards();
    renderSavedSuites();
    showToast('🗑 Suite supprimée');
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
  showToast('⏹ Suite "' + (_stoppedSuite?.title || suiteId) + '" arrêtée');
}
async function runSuiteGroup(idx) {
  if (window._suiteRunning) {
    // Ask user if they want to force restart
    showToast('⚠️ Une suite est déjà en cours — recharge la page si bloqué');
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

  if (tests.length === 0) { showToast('⚠️ Aucun test dans cette suite'); return; }

  window._suiteBloc_reports = []; // reset
  window._suiteTotal = tests.length;
  window._suiteStopped = false;
  window._currentSuiteTitle = suite.title;
  // Live broadcast suite-start
  fetch('http://localhost:3001/api/rf/live-suite-start', {
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
    '<span id="suite-progress-label" style="font-size:13px;font-weight:600">⏳ Suite : ' + escHtml(suite.title) + ' — 0/' + tests.length + '</span>' +
    '</div></div>';
  document.getElementById('messages').appendChild(suiteProgressDiv);
  suiteProgressDiv.scrollIntoView({ behavior: 'smooth' });

  // Run each bloc sequentially in suite order
  window._suiteStopped = false;
  try {
  for (let i = 0; i < tests.length; i++) {
    if (window._suiteStopped) { showToast('⏹ Suite arrêtée'); break; }
    // Update progress label using the specific div for this run
    const lbl = suiteProgressDiv.querySelector('#suite-progress-label');
    if (lbl) lbl.textContent = '⏳ Suite : ' + suite.title + ' — ' + (i+1) + '/' + tests.length + ' en cours...';
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
            const r = await fetch('http://localhost:3001/api/rf/status');
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
    ? '⏹ Suite arrêtée : ' + suite.title + ' — arrêt manuel'
    : '✅ Suite : ' + suite.title + ' — ' + tests.length + '/' + tests.length + ' terminé';

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
  showToast('✅ Suite ' + suite.title + ' terminée — ' + tests.length + ' bloc(s)');
}


async function runCheckedSuiteGroups() {
  if (window._suiteBatchRunning || window._suiteRunning) { showToast('⏳ Une suite est déjà en cours'); return; }
  // dedup : un meme suiteId ne doit etre lance qu'une fois par clic
  const ids = [...new Set([...document.querySelectorAll('.suite-group-cb:checked')].map(cb => cb.dataset.suiteId))];
  if (ids.length === 0) { showToast('⚠️ Coche au moins une suite'); return; }
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
  showToast(t.enabled ? '✅ Activé' : '⬜ Désactivé');
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
  showToast('🔀 Ordre mis à jour');
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
    showToast('🧪 ' + id + ' ajouté à "' + savedSuites[suiteIdx].title + '"');
  } catch(err) {
    showToast('⚠️ Drop impossible : ' + err.message);
  }
}

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





// ── Delete report card ────────────────────────────────────────────────────────
function deleteReportCard(cardId, runNum) {
  showConfirmDialog('🗑 Supprimer le rapport', 'Supprimer le rapport <b>RUN #' + runNum + '</b> ?', () => {
    // Remove from DOM
    document.getElementById(cardId)?.remove();
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
  };

  // Broadcaster la fin de suite dans le live panel
  fetch('http://localhost:3001/api/rf/live-suite-end', {
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
    blocs: suiteReports.map((r,i) => ({idx:i+1,name:r.suiteName||'',total:r.total||0,passed:r.passed||0,failed:r.failed||0,duration:r.duration||0})),
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

// ── Stats bar update ─────────────────────────────────────────────────────────

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
