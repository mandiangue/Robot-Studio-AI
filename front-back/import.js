// ============================================================================
// import.js — imports : CSV/XLS (importTCFromFile) et projet Robot Framework
//             (importRFProject, _rf*, _importRFFiles). Extrait de qa-agent.js.
// ============================================================================

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
    if (!out.cases.length) { showToast(t('imp.noCasesDetected')); return; }
    if (typeof renderTestCasesCard !== 'function') { showToast(t('imp.renderMissing')); return; }
    renderTestCasesCard(out.cases, out.url, true);
    showToast('\U0001F4E5 ' + t('imp.casesImportedTxt').replace('{n}', out.cases.length) + (out.url ? ' \u00b7 ' + out.url : ''));
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
    reader.onerror = () => showToast(t('imp.fileReadError'));
    reader.readAsText(file, 'utf-8');
  } else if (ext === 'xlsx' || ext === 'xls') {
    showToast(t('imp.loadingXlsxReader'));
    _ensureXLSX().then(() => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const wb = XLSX.read(new Uint8Array(reader.result), { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });
          finish(rows.map(r => (r || []).map(c => (c == null ? '' : String(c)))));
        } catch (e) { showToast(t('imp.xlsxReadError') + e.message); }
      };
      reader.onerror = () => showToast(t('imp.fileReadError'));
      reader.readAsArrayBuffer(file);
    }).catch(() => showToast(t('imp.xlsxReaderMissing')));
  } else {
    showToast(t('imp.unsupportedFormat'));
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
    + (f.binary ? ' <span style="color:var(--gray,#9ca3af);font-size:10px">' + t('imp.binaryTag') + '</span>' : '')
    + '</div>'
  ).join('');
  ov.innerHTML =
    '<div style="background:var(--surface,#15202b);border:1px solid var(--border,#2a3744);border-radius:14px;max-width:660px;width:100%;max-height:82vh;display:flex;flex-direction:column;overflow:hidden">'
    + '<div style="padding:16px 20px;border-bottom:1px solid var(--border,#2a3744);font-family:Syne,sans-serif;font-weight:700;font-size:16px;color:var(--text,#e2e8f0)">\uD83D\uDCC2 ' + t('imp.importProjectTitleTxt').replace('{title}', esc(title)) + '</div>'
    + '<div style="padding:10px 20px 6px;color:var(--gray,#9ca3af);font-size:13px">' + t('imp.fileBinarySubline').replace('{n}', files.length).replace('{bin}', bin ? t('imp.binarySuffix').replace('{n}', bin) : '') + '</div>'
    + '<div style="padding:0 20px 8px;overflow:auto;flex:1">' + rows + '</div>'
    + '<div style="padding:14px 20px;border-top:1px solid var(--border,#2a3744);display:flex;gap:10px;justify-content:flex-end">'
    + '<button id="_rfCancel" style="background:transparent;border:1px solid var(--border,#2a3744);color:var(--text,#e2e8f0);padding:8px 16px;border-radius:8px;cursor:pointer">' + t('imp.cancel') + '</button>'
    + '<button id="_rfOk" style="background:var(--teal,#2dd4bf);border:none;color:#06202a;font-weight:700;padding:8px 18px;border-radius:8px;cursor:pointer">' + t('imp.import') + '</button>'
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
showToast('📂 ' + t('imp.projectImportedTxt').replace('{title}', title).replace('{n}', files.length));
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
  if (!kept.length) { showToast(t('imp.noUsableFile')); return; }
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
  if (!clean.filter(e => /\.(robot|resource)$/i.test(e.relPath)).length) { showToast(t('imp.noRobotFound')); return; }
  _rfImportModal(rootSeg, _buildRFCard(clean));
}
function _rfOpenImportModal() {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML =
    '<div style="background:var(--surface,#15202b);border:1px solid var(--border,#2a3744);border-radius:14px;max-width:560px;width:100%;overflow:hidden">'
    + '<div style="padding:16px 20px;border-bottom:1px solid var(--border,#2a3744);font-family:Syne,sans-serif;font-weight:700;font-size:16px;color:var(--text,#e2e8f0)">\uD83D\uDCC2 ' + t('imp.importProjectDropTitleTxt') + '</div>'
    + '<div id="_rfDrop" style="margin:20px;padding:42px 20px;border:2px dashed var(--border,#2a3744);border-radius:12px;text-align:center;color:var(--gray,#9ca3af);font-size:14px">' + t('imp.dropHint') + '<br><span style="font-size:12px">' + t('imp.dropHintSub') + '</span></div>'
    + '<div style="padding:0 20px 16px;display:flex;gap:10px;justify-content:space-between;align-items:center">'
    + '<span style="color:var(--gray,#9ca3af);font-size:12px">' + t('imp.orChooseFolder') + '</span>'
    + '<button id="_rfClose" style="background:transparent;border:1px solid var(--border,#2a3744);color:var(--text,#e2e8f0);padding:8px 16px;border-radius:8px;cursor:pointer">' + t('imp.close') + '</button>'
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
    dz.innerHTML = t('imp.readingFolder');
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
  if (!picked.length) { showToast(t('imp.noRfInFolder')); return; }
  showToast(t('imp.readingProject'));
  try {
    const entries = await Promise.all(picked.map(async f => {
      const rp = (f.webkitRelativePath || f.name);
      const relPath = rp.split('/').slice(1).join('/') || rp;
      const content = await f.text();
      return { relPath, content };
    }));
    if (!entries.filter(e => /\.(robot|resource)$/i.test(e.relPath)).length) {
      showToast(t('imp.noRobotFound')); return;
    }
    _rfImportModal(title, _buildRFCard(entries));
  } catch (e) {
    showToast(t('imp.projectImportError') + e.message);
  }
}
function _importRFFiles(files, source) {
  if (!files || !files.length) { showToast(t('imp.noRobotFile')); return; }
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
      if (btn) { btn.style.background='rgba(192,132,252,0.18)'; btn.style.color='#c084fc'; btn.style.borderColor='#c084fc'; btn.textContent=t('codecards.tagged'); }
    }, 100);
    saveCodeCards();
    _savePulledBlock(existing.cardId, source, rf, true);
    showToast(t('imp.blockUpdated') + source);
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
    if (btn) { btn.style.background='rgba(192,132,252,0.18)'; btn.style.color='#c084fc'; btn.style.borderColor='#c084fc'; btn.textContent=t('codecards.tagged'); }
  }, 100);

  saveCodeCards();
  _savePulledBlock(stableId, source, rf, true);
  showToast(t('imp.filesImported').replace('{n}', rf.length) + source);
}
