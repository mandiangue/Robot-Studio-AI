// ============================================================================
// codecards.js — rendu des messages code & cartes de résultat (openCodeWindow,
//                renderCodeMsg, renderMultiFileMsg, renderResultCard, buildFileTree).
// ============================================================================

// ── Render code message ────────────────────────────────────────────────────────

// ── Open code in a new window ──────────────────────────────────────────────────
function openCodeWindow(files) {
  // files = [{ filename, code }]
  const win = window.open('', '_blank');
  if (!win) { showToast(t('codecards.popupBlocked')); return; }

  const tabsHtml = files.map((f, i) =>
    `<button class="tab ${i===0?'active':''}" onclick="switchTab(${i})" id="tab-${i}">${f.filename}</button>`
  ).join('');

  const contentHtml = files.map((f, i) =>
    `<div class="pane ${i===0?'active':''}" id="pane-${i}"><pre>${syntaxHLwin(escHtmlWin(f.code))}</pre></div>`
  ).join('');

  // Inline syntax highlight for the popup (no external deps)
  function syntaxHLwin(c) {
    return c
      .replace(/(\*{3}[^*]+\*{3})/g, '<span style="color:#e06c75;font-weight:700">$1</span>')
      .replace(/(#[^\n]*)/g, '<span style="color:#5c6370;font-style:italic">$1</span>')
      .replace(/(\$\{[^}]+\})/g, '<span style="color:#e5c07b">$1</span>')
      .replace(/(\[(?:Arguments|Return|Documentation|Tags|Setup|Teardown|Timeout)\])/g, '<span style="color:#c678dd">$1</span>');
  }
  function escHtmlWin(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  win.document.write(`<!DOCTYPE html>
<html lang="${currentLang}">
<head>
<meta charset="UTF-8">
<title>${files[0].filename}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#ffffff; color:#e2eaf3; font-family:'IBM Plex Mono',monospace; height:100vh; display:flex; flex-direction:column; }
  .topbar { display:flex; align-items:center; gap:10px; padding:10px 16px; background:#ffffff; border-bottom:1px solid #1c2a38; flex-shrink:0; }
  .topbar h1 { font-size:13px; color:#059669; letter-spacing:2px; }
  .topbar .actions { margin-left:auto; display:flex; gap:8px; }
  .btn { background:rgba(0,212,170,0.08); border:1px solid #059669; color:#059669; padding:6px 14px; border-radius:6px; font-size:11px; font-family:'IBM Plex Mono',monospace; cursor:pointer; transition:all .15s; }
  .btn:hover { background:rgba(0,212,170,0.2); }
  .btn.red { border-color:#DC2626; color:#DC2626; background:rgba(230,57,70,0.08); }
  .btn.red:hover { background:rgba(230,57,70,0.2); }
  .tabs { display:flex; background:#ffffff; border-bottom:1px solid #1c2a38; overflow-x:auto; flex-shrink:0; }
  .tab { padding:9px 18px; font-size:11px; color:#4a6278; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; font-family:'IBM Plex Mono',monospace; background:none; border-top:none; border-left:none; border-right:1px solid #1c2a38; transition:all .15s; }
  .tab.active { color:#059669; border-bottom-color:#059669; background:rgba(0,212,170,0.05); }
  .tab:hover { color:#e2eaf3; }
  .pane { display:none; flex:1; overflow:auto; padding:20px 24px; }
  .pane.active { display:block; }
  pre { font-family:'IBM Plex Mono',monospace; font-size:13px; line-height:1.75; white-space:pre; color:#7dd3c8; }
  .toast { position:fixed; bottom:20px; right:20px; background:#059669; color:#07090f; padding:10px 18px; border-radius:8px; font-weight:700; font-size:12px; opacity:0; transform:translateY(30px); transition:all .3s; pointer-events:none; }
  .toast.show { opacity:1; transform:translateY(0); }
</style>
</head>
<body>
<div class="topbar">
  <h1>${t('popup.title')}</h1>
  <div class="actions">
    <button class="btn" onclick="copyActive()" title="${t('popup.tCopyAll')}">${t('popup.copy')}</button>
    <button class="btn" onclick="downloadActive()">${t('popup.download')}</button>
    <button class="btn" onclick="downloadAll()">${t('popup.downloadAll')}</button>
    <button class="btn red" onclick="resetAll()">${t('popup.reset')}</button>
  </div>
</div>
<div class="tabs" id="tabs">${tabsHtml}</div>
<div id="content">${contentHtml}</div>
<div class="toast" id="toast"></div>
<script>
  const FILES = ${JSON.stringify(files)};
  let active = 0;

  function switchTab(i) {
    active = i;
    document.querySelectorAll('.tab').forEach((t,j) => t.classList.toggle('active', i===j));
    document.querySelectorAll('.pane').forEach((p,j) => p.classList.toggle('active', i===j));
  }

  function copyActive() {
    navigator.clipboard.writeText(FILES[active].code).then(() => toast(${JSON.stringify(t('popup.copied'))}));
  }

  function downloadActive() {
    download(FILES[active].filename, FILES[active].code);
  }

  function downloadAll() {
    FILES.forEach(f => download(f.filename, f.code));
    toast(${JSON.stringify(t('popup.filesDownloaded'))}.replace('{n}', FILES.length));
  }

  function download(filename, code) {
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(code);
    a.download = filename;
    a.click();
  }

  function resetAll() {
    if (confirm(${JSON.stringify(t('popup.closeConfirm'))})) window.close();
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }
<\/script>
</body>
</html>`);
  win.document.close();
}

function renderCodeMsg(code, filename) {
  const clean = cleanRobotCode((code||''));
  _lastGeneratedCode = clean;
  _lastGeneratedFile = filename?.replace('.robot','') || 'test_generated';
  // Save for persistence
  window._codeCards = window._codeCards || [];
  const cardId4 = 'result-' + Date.now();
  const title4 = window._lastGeneratedTitle || filename?.replace('.robot','') || 'Code RF';
  window._codeCards.push({ type: 'single', cardId: cardId4, title: title4, files: [{ filename: filename||'test_generated.robot', code: clean }] });
  saveCodeCards();
  /* SYNC-ON-GEN */ try { window._lastCardId = cardId4; syncCardFilesToDisk(cardId4).then(() => showToast(t('codecards.fileSynced'))); } catch(e){}
  // Note: variables.robot snapshot désactivé — les fichiers sont déjà dans card.files
  try { localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards)); } catch(e) {}
  renderResultCard([{ filename, code: clean }], cardId4);
  setTimeout(() => injectRunButton(clean, filename), 120);
  registerSuiteTest(filename || 'test_generated.robot', clean);
}

function injectRunButton(code, filename) {
  const messages = document.getElementById('messages');
  const lastMsg  = messages?.lastElementChild;
  if (!lastMsg) return;
  const bubble = lastMsg.querySelector('.msg-bubble');
  if (!bubble || bubble.querySelector('.run-tests-btn')) return;

  const bar = document.createElement('div');
  bar.style.cssText = 'margin-top:14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap';

  const headlessEl = document.getElementById('optHeadless');
  const isHeadless = headlessEl?.value === 'headless';

  bar.innerHTML = `
    <button class="run-tests-btn"
      onclick="runTests(this)"
      data-code="${encodeURIComponent(code)}"
      data-filename="${encodeURIComponent(filename || 'test_generated.robot')}"
      style="background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#07090f;
             padding:10px 22px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;
             font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.5px;display:flex;align-items:center;gap:8px">
      ▶️ Lancer les tests
    </button>
    <span style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace" id="runModeLabel">
      ${isHeadless ? '🔇 headless' : '🖥️ visible'}
    </span>`;
  bubble.appendChild(bar);

  // Update label when select changes
  headlessEl?.addEventListener('change', () => {
    const lbl = bubble.querySelector('#runModeLabel');
    if (lbl) lbl.textContent = headlessEl.value === 'headless' ? '🔇 headless' : '🖥️ visible';
  });
}

// ── Render multi-file message ──────────────────────────────────────────────────

// ── Clean Robot Framework code — remove HTML artifacts and Settings leaks ─────
function cleanRobotCode(code) {
  if (!code) return '';
  // Supprimer le HTML de coloration syntaxique si present
  code = code.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  code = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

  // Apply Suite Teardown cleanup if mode is per-suite
  const sessionMode = document.getElementById('optBrowserSession')?.value || 'per-test';
  if (sessionMode === 'per-suite') {
    // Remove BDD steps that open the browser in each test
    code = code.replace(/^[ \t]+(Given|When|Then|And|But)[ \t]+[^\n]*(Opens?|Launch|Start)[^\n]*(Login|App|Application|Browser|Page|Site)[^\n]*$/gm, '');
    // Remove BDD steps that close the browser in each test
    code = code.replace(/^[ \t]+(Given|When|Then|And|But|Finally)[ \t]+[^\n]*(Close|Quit|Exit)[^\n]*(Browser|Application|Session|App)[^\n]*$/gm, '');
    code = code.replace(/^[ \t]+(Given|When|Then|And|But|Finally)[ \t]+[^\n]*(Browser|Application)[^\n]*(Close|Is Closed|Closed)[^\n]*$/gm, '');
    // Remove direct Close Browser / Open Browser
    code = code.replace(/^[ \t]+(Close Browser|Close Application|Open Browser|Open Application)[^\n]*$/gm, '');
    // Remove [Teardown] Close Browser
    code = code.replace(/^[ \t]+\[Teardown\][^\n]*(Close|Browser|Application)[^\n]*$/gm, '');
    // Remove Test Teardown that closes browser
    code = code.replace(/^Test Teardown[^\n]*(Close|Browser|Application)[^\n]*$/gm, '');
    code = code.replace(/^Suite Setup\s+Register[^\n]*$/gm, '');
    // Remove Suite Setup / Suite Teardown already present to avoid duplicates
    code = code.replace(/^Suite Setup[^\n]*$/gm, '');
    code = code.replace(/^Suite Teardown[^\n]*$/gm, '');
    // Detect URL variable from code
    const urlVarM = code.match(/\$\{(\w*(?:URL|LOGIN|BASE|HOME)\w*)\}/i);
    const urlVar2 = urlVarM ? '\${' + urlVarM[1] + '}' : '\${BASE_URL}';
    const browserVar2 = code.includes('\${BROWSER}') ? '\${BROWSER}' : getBrowserType();
    // Add Suite Setup + Suite Teardown once
    code = code.replace(/(\*\*\* Settings \*\*\*[^\n]*\n)/, '$1Suite Setup       Open Browser    ' + urlVar2 + '    ' + browserVar2 + '\nSuite Teardown    Close Browser\n');
  }

  // 1. Strip HTML artifacts from syntax highlighting
  code = code
    .replace(/[a-f0-9]{6};font-weight:\d+">\*{3}/g, '***')
    .replace(/[a-f0-9]{6};font-weight:\d+">/g, '')
    .replace(/<span[^>]*>/g, '')
    .replace(/<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/```/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  // 2. Remove duplicate *** Settings *** blocks — keep only first
  const sections = code.split(/(\*{3}\s*\w[^\n]*\*{3})/g);
  let seenSettings = false;
  let result = '';
  let skipUntilSection = false;
  const lines = code.split('\n');
  let inSettings = false;
  let settingsCount = 0;
  const cleaned = [];

  for (const line of lines) {
    const t = line.trim();
    if (/^\*{3}\s*Settings\s*\*{3}/.test(t)) {
      settingsCount++;
      if (settingsCount > 1) { inSettings = true; continue; } // skip duplicate Settings block
      inSettings = false;
      cleaned.push(line);
      continue;
    }
    if (/^\*{3}/.test(t) && !/^\*{3}\s*Settings/.test(t)) {
      inSettings = false; // end of any Settings block
    }
    if (inSettings) continue; // skip content of duplicate Settings blocks
    cleaned.push(line);
  }
  code = cleaned.join('\n');

  // 3. Remove Settings directives leaked into *** Test Cases ***
  const lines2 = code.split('\n');
  let inTests = false;
  const cleaned2 = [];
  for (const line of lines2) {
    const t = line.trim();
    if (/^\*{3}\s*Test Cases/.test(t)) { inTests = true; cleaned2.push(line); continue; }
    if (/^\*{3}/.test(t)) { inTests = false; cleaned2.push(line); continue; }
    if (inTests && /^(Documentation|Library|Resource|Suite Setup|Suite Teardown|Test Setup|Test Teardown|Variables|Metadata)[ \t]+/.test(t) && !/^\s+/.test(line)) {
      continue; // skip leaked settings
    }
    cleaned2.push(line);
  }
  return cleaned2.join('\n');
}

function renderMultiFileMsg(raw) {
  // Full clean: strip markdown code fences, HTML tags, HTML entities
  function cleanCode(s) {
    return (s||'')
      .replace(/```[a-z]*\n?/gi, '')        // remove ```robot ```python etc
      .replace(/```/g, '')                   // remove remaining backticks
      .replace(/<span[^>]*>/g, '')           // remove <span style="...">
      .replace(/<\/span>/g, '')             // remove </span>
      .replace(/<[^>]+>/g, '')              // remove any remaining HTML tags
      .replace(/[a-f0-9]{6};font-weight:\d+">\*{3}/g, '***')  // fix colored section headers
      .replace(/[a-f0-9]{6};font-weight:\d+">/g, '')  // fix any remaining color artifacts
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  const cleanRaw = cleanCode(raw);

  // Flexible file delimiter — matches ***** FILE: path | label | desc
  const FILE_RE = /[*]{4,6}\s*FILE:\s*([^|\n]+)\|([^|\n]+)\|([^\n]*)/g;
  const headers = [...cleanRaw.matchAll(FILE_RE)];

  if (headers.length === 0) {
    renderResultCard([{ filename: 'test_generated.robot', code: cleanRaw }]);
    return;
  }

  // Split on the delimiter lines to extract code between them
  const splitRe  = /[*]{4,6}\s*FILE:[^\n]*\n?/g;
  const segments = raw.split(splitRe);
  // segments[0] = text before first FILE: (usually empty)
  // segments[1..n] = code for each file

  const files = headers.map((h, i) => ({
    filename: h[1].trim(),
    code:     cleanRobotCode((segments[i + 1] || '').trim()),
    label:    h[2].trim(),
    desc:     h[3].trim(),
  }));

  // Split tests/tests.robot en feature_*.robot selon les pages si plusieurs pages detects
  const pageFiles = files.filter(f => f.filename.startsWith('resources/pages/'));
  if (pageFiles.length > 1) {
    const testsFile = files.find(f => f.filename === 'tests/tests.robot');
    if (testsFile) {
      // Parser les TC du fichier tests.robot
      const lines = testsFile.code.split('\n');
      const tcStart = lines.findIndex(l => l.trim().startsWith('*** Test Cases ***'));
      const header = tcStart >= 0 ? lines.slice(0, tcStart + 1).join('\n') + '\n' : '';
      // Extraire chaque TC
      const tcBlocks = [];
      let current = null;
      for (let i = (tcStart >= 0 ? tcStart + 1 : 0); i < lines.length; i++) {
        const line = lines[i];
        if (line && !/^\s/.test(line) && !line.startsWith('#') && line.trim() && !line.startsWith('*')) {
          if (current) tcBlocks.push(current);
          current = { name: line.trim(), lines: [line] };
        } else if (current) {
          current.lines.push(line);
        }
      }
      if (current) tcBlocks.push(current);

      if (tcBlocks.length > 0 && pageFiles.length > 1) {
        // Associer chaque TC à une page selon les keywords appelés
        const newFiles = [];
        const tcPerPage = {};
        tcBlocks.forEach(tc => {
          const tcText = tc.lines.join('\n').toLowerCase();
          let assignedPage = null;
          // Chercher la première page qui match — un TC va dans UNE SEULE page
          for (const pf of pageFiles) {
            const pageName = pf.filename.split('/').pop().replace('_page.robot','').replace('.robot','');
            if (tcText.includes(pageName.toLowerCase())) {
              assignedPage = pageName;
              break;
            }
          }
          if (!assignedPage) {
            // TC sans page associée — mettre dans la première page
            assignedPage = pageFiles[0].filename.split('/').pop().replace('_page.robot','').replace('.robot','');
          }
          if (!tcPerPage[assignedPage]) tcPerPage[assignedPage] = [];
          tcPerPage[assignedPage].push(tc);
        });

        // Créer un fichier par page
        const headerBase = header.replace('tests/tests.robot', '');
        Object.entries(tcPerPage).forEach(([pageName, tcs]) => {
          if (tcs.length === 0) return;
          const fname = 'tests/feature_' + pageName.toLowerCase().replace(/[^a-z0-9]/g,'_') + '.robot';
          const code = headerBase + tcs.map(tc => tc.lines.join('\n')).join('\n') + '\n';
          newFiles.push({ filename: fname, code, label: 'tests', desc: 'Tests ' + pageName });
        });

        if (newFiles.length > 1) {
          // Remplacer tests.robot par les fichiers feature_*.robot
          const idx = files.indexOf(testsFile);
          files.splice(idx, 1, ...newFiles);
          console.log('[SPLIT] tests.robot -> ' + newFiles.map(f => f.filename).join(', '));
        }
      }
    }
  }

  // Renuméroter les TC globalement et en ordre continu
  let globalTcCounter = 1;
  files.filter(f => f.filename.startsWith('tests/')).forEach(f => {
    f.code = f.code.replace(/^(TC_\d+)( .+)$/gm, (m, tc, name) => {
      return 'TC_' + String(globalTcCounter++).padStart(3,'0') + name;
    });
  });

  // If no tests/ file — auto-generate one from keywords found in keywords.robot
  const hasTests = files.some(f => f.filename.startsWith('tests/'));
  if (!hasTests) {
    const kwFile = files.find(f => f.filename.includes('keywords'));
    const varFile = files.find(f => f.filename.includes('variables'));
    const library = (() => {
      const src = (kwFile?.code || '') + (varFile?.code || '');
      const m = src.match(/Library\s+(\S+Library)/);
      return m ? m[1] : 'SeleniumLibrary';
    })();

    // Extract keyword names (lines not indented, not starting with # or *)
    const kwNames = [];
    if (kwFile) {
      kwFile.code.split('\n').forEach(line => {
        const t = line.trim();
        if (t && !t.startsWith('#') && !t.startsWith('*') && !t.startsWith('$') && !t.startsWith('[') && !/^\s/.test(line) && t.length > 3 && /^[A-Za-zÀ-ÿ]/.test(t)) {
          kwNames.push(t);
        }
      });
    }

    // Build resource imports for page files
    const pageImports = files
      .filter(f => f.filename.startsWith('resources/pages/'))
      .map(f => 'Resource    ../resources/pages/' + f.filename.split('/').pop())
      .join('\n');

    let testCode = '*** Settings ***\n';
    testCode += 'Documentation    Tests principaux\n';
    testCode += 'Library    ' + library + '\n';
    testCode += 'Resource    ../resources/variables.robot\n';
    testCode += 'Resource    ../resources/keywords.robot\n';
    if (pageImports) testCode += pageImports + '\n';
    testCode += '\n*** Test Cases ***\n';

    if (kwNames.length > 0) {
      kwNames.slice(0, 8).forEach((kw, i) => {
        testCode += 'TC_' + String(i+1).padStart(3,'0') + ' ' + kw + '\n';
        testCode += '    ' + kw + '\n\n';
      });
    } else {
      testCode += 'TC_001 Test principal\n    Log    Ajoute tes keywords ici\n\n';
    }

    files.push({
      filename: 'tests/tests.robot',
      code:     testCode,
      label:    'tests',
      desc:     'Cas de tests auto-générés',
    });
  }

  // Save for persistence
  window._codeCards = window._codeCards || [];
  // Store clean code (not encoded)
  const cardId5 = 'result-' + Date.now();
  const title5 = window._lastGeneratedTitle || 'Code RF';
  // Rendre visible le __init__.robot (Setup/Teardown centralises) dans l arborescence
  if (!files.some(f => String(f.filename || '').endsWith('__init__.robot'))) {
    const allGenCode = files.map(f => f.code || '').join('\n');
    const isBrowserGen = /^[ \t]*Library[ \t]+Browser[ \t]*$/m.test(allGenCode)
                      || /Fill Text|New Browser|New Page|Wait For Elements State/.test(allGenCode);
    const isSuiteModeGen = /^Suite Setup/m.test(allGenCode);
    const openKwInit = isBrowserGen
      ? 'Open Browser Session    ${BASE_URL}'
      : 'Open Browser No Popup    ${BASE_URL}    ${BROWSER}';
    const initLines = [
      '*** Settings ***',
      'Resource    ../resources/variables.robot',
      'Resource    ../resources/keywords.robot'
    ];
    if (isSuiteModeGen) {
      initLines.push('Suite Setup     ' + openKwInit);
      initLines.push('Suite Teardown  Close Browser');
      initLines.push('Test Setup      Go To    ${BASE_URL}');
    } else {
      initLines.push('Test Setup      ' + openKwInit);
      initLines.push('Test Teardown   Close Browser');
    }
    initLines.push('');
    files.push({
      filename: 'tests/__init__.robot',
      type: 'init',
      title: 'Init (Setup/Teardown)',
      code: initLines.join('\n')
    });
  }
  // Centraliser : retirer Test/Suite Setup/Teardown de tous les fichiers hors __init__
  if (files.some(f => String(f.filename || '').endsWith('__init__.robot'))) {
    files.forEach(f => {
      const fnD = String(f.filename || '');
      if (fnD.endsWith('__init__.robot') || !f.code) return;
      f.code = f.code
        .replace(/^Test Setup[^\n]*\n?/gm, '')
        .replace(/^Test Teardown[^\n]*\n?/gm, '')
        .replace(/^Suite Setup[^\n]*\n?/gm, '')
        .replace(/^Suite Teardown[^\n]*\n?/gm, '');
    });
  }
  window._codeCards.push({ type: 'multi', cardId: cardId5, title: title5, files: files.map(f => ({ ...f, code: f.code })) });
  saveCodeCards();

  renderResultCard(files, cardId5);
}

// ── Render result card in chat ─────────────────────────────────────────────────

function buildFileTree(files, activeTab, cardId) {
  const tree = {};
  files.forEach((f, i) => {
    if (f.filename.endsWith('.gitkeep')) return; // hidden placeholder
    const parts = f.filename.split('/');
    const folder = parts.length === 1 ? '' : parts.slice(0, -1).join('/');
    if (!tree[folder]) tree[folder] = [];
    // Ensure parent folders exist even if empty
    const parts2 = folder.split('/');
    for (let p = 1; p <= parts2.length; p++) {
      const pf = parts2.slice(0, p).join('/');
      if (pf && !tree[pf]) tree[pf] = [];
    }
    // Dedup : n'ajoute pas si le fichier est deja present (meme fullPath)
    if (!tree[folder].some(function(x){ return x.fullPath === f.filename; })) {
      tree[folder].push({ name: parts[parts.length-1], idx: i, fullPath: f.filename });
    }
  });
  // Also create empty folder entries from .gitkeep files
  files.forEach((f, i) => {
    if (!f.filename.endsWith('.gitkeep')) return;
    const folder = f.filename.replace('/.gitkeep', '');
    if (!tree[folder]) tree[folder] = [];
  });

  const fileItemHtml = (f, indent) => {
    const active = f.idx === activeTab;
    return `<div class="tree-file-row" data-ridx="${f.idx}" data-card="${cardId}" data-raction="tab"
      draggable="true"
      ondragstart="window._treeDrag={idx:${f.idx},cardId:'${cardId}'};event.currentTarget.style.opacity='.4'"
      ondragend="event.currentTarget.style.opacity='1'"
      style="display:flex;align-items:center;gap:4px;padding:4px 8px 4px ${indent}px;cursor:pointer;font-size:11px;
             color:${active?'var(--teal)':'var(--gray)'};
             background:${active?'rgba(0,212,170,0.08)':'transparent'};
             border-left:2px solid ${active?'var(--teal)':'transparent'};
             font-family:'IBM Plex Mono',monospace;white-space:nowrap;transition:all .1s;user-select:none">
      <span>📄</span>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis" title="${escHtml(f.fullPath)}">${escHtml(f.name)}</span>
      <span class="tree-actions" style="display:flex;gap:2px;margin-left:auto">
        <button data-raction="file-rename" data-ridx="${f.idx}" data-card="${cardId}"
          style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:10px;padding:1px 3px"
          data-i18n-title="codecards.tRename" title="Renommer">✏️</button>
        <button data-raction="file-delete" data-ridx="${f.idx}" data-card="${cardId}"
          style="background:transparent;border:none;color:var(--red);cursor:pointer;font-size:10px;padding:1px 3px"
          data-i18n-title="codecards.tDelete" title="Supprimer">🗑</button>
      </span>
    </div>`;
  };

  if (!window._treeCollapsed) window._treeCollapsed = new Set();

  const folderHtml = (folder) => {
    const depth = folder.split('/').length;
    const indent = depth * 12;
    const colKey = cardId + '::' + folder;
    const isCollapsed = window._treeCollapsed.has(colKey);
    return `<div class="tree-folder-row" data-folder="${escHtml(folder)}" data-card="${cardId}" data-colkey="${escHtml(colKey)}"
      draggable="true"
      ondragstart="window._treeDrag={folder:'${escHtml(folder)}',cardId:'${cardId}'};event.currentTarget.style.opacity='.4'"
      ondragend="event.currentTarget.style.opacity='1'"
      ondragover="event.preventDefault();event.currentTarget.style.background='rgba(0,212,170,0.1)'"
      ondragleave="event.currentTarget.style.background=''"
      ondrop="treeDropToFolder(event,'${escHtml(folder)}','${cardId}');event.currentTarget.style.background=''"
      style="display:flex;align-items:center;gap:4px;padding:5px 8px 2px ${indent}px;font-size:10px;
             color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;
             border-radius:4px;transition:background .1s;user-select:none;cursor:pointer">
      <span>${isCollapsed ? '📁' : '📂'}</span>
      <span style="flex:1" onclick="treeFolderToggle(event,'${escHtml(colKey)}','${cardId}')">${escHtml(folder.split('/').pop())}</span>
      <span class="tree-folder-actions" style="display:flex;gap:2px;margin-left:auto">
        <button data-raction="folder-rename" data-folder="${escHtml(folder)}" data-card="${cardId}"
          style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:10px;padding:1px 3px"
          data-i18n-title="codecards.tRename" title="Renommer">✏️</button>
        <button data-raction="folder-delete" data-folder="${escHtml(folder)}" data-card="${cardId}"
          style="background:transparent;border:none;color:var(--red);cursor:pointer;font-size:10px;padding:1px 3px"
          data-i18n-title="codecards.tDelete" title="Supprimer">🗑</button>
      </span>
    </div>`;
  };

  const addFileBtn = (folder) => `<button onclick="treeAddFile('${escHtml(folder)}','${cardId}')" data-i18n="codecards.newFile" data-i18n-title="codecards.tNewFile"
    style="display:flex;align-items:center;gap:4px;padding:2px 8px 2px ${folder?'28px':'16px'};
           background:transparent;border:none;color:rgba(0,212,170,0.5);cursor:pointer;font-size:10px;
           font-family:'IBM Plex Mono',monospace;width:100%;text-align:left"
    title="Nouveau fichier">+ nouveau fichier</button>`;

  const addFolderBtn = (parentFolder) => `<button onclick="treeAddFolder('${escHtml(parentFolder)}','${cardId}')" data-i18n="codecards.newFolder" data-i18n-title="codecards.tNewFolder"
    style="display:flex;align-items:center;gap:4px;padding:2px 8px 2px ${parentFolder?'28px':'16px'};
           background:transparent;border:none;color:rgba(168,85,247,0.6);cursor:pointer;font-size:10px;
           font-family:'IBM Plex Mono',monospace;width:100%;text-align:left"
    title="Nouveau dossier">+ nouveau dossier</button>`;

  let html = '';
  if (tree['']) tree[''].forEach(f => { html += fileItemHtml(f, 12); });
  html += addFileBtn('');
  html += addFolderBtn('');

  Object.keys(tree).filter(k=>k!=='').sort().forEach(folder => {
    html += folderHtml(folder);
    const colKey = cardId + '::' + folder;
    const isCollapsed = window._treeCollapsed && window._treeCollapsed.has(colKey);
    if (!isCollapsed) {
      tree[folder].forEach(f => { html += fileItemHtml(f, 22); });
      html += addFileBtn(folder);
      html += addFolderBtn(folder);
    }
  });

  return html;
}

function treeFolderToggle(e, colKey, cardId) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  if (!window._treeCollapsed) window._treeCollapsed = new Set();
  if (window._treeCollapsed.has(colKey)) window._treeCollapsed.delete(colKey);
  else window._treeCollapsed.add(colKey);
  // Re-render l'arbre du bloc
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card) return;
  const treeEl = document.querySelector('#' + cardId + ' [style*="width:200px"]');
  if (treeEl) {
    const inner = treeEl.querySelector('[style*="ARBORESCENCE"]')?.parentElement || treeEl;
    // Reconstruire uniquement la partie arbre (après le header)
    const headerEl = treeEl.querySelector('[style*="ARBORESCENCE"]')?.closest('div[style*="padding:0 8px"]');
    if (headerEl) {
      // Supprimer tout après le header et réinjecter
      let next = headerEl.nextSibling;
      while (next) { const tmp = next.nextSibling; next.remove(); next = tmp; }
      treeEl.insertAdjacentHTML('beforeend', buildFileTree(card.files, 0, cardId).replace(/^[\s\S]*?(?=<div class="tree-)/, ''));
    }
  }
  // Re-render complet du bloc pour mettre à jour l'arbre
  const el = document.getElementById(cardId);
  if (el && card) { el.remove(); renderResultCard(card.files, cardId); }
}
// Bascule de langue : retraduit SEULEMENT le toggle (état via emoji) et le compteur d'en-tête.
// Le reste du chrome est géré par applyI18n(document) ; on n'appelle JAMAIS buildCard ici
// (préserve onglet actif, éditeur ouvert, textarea non sauvé, cases cochées, _treeCollapsed).
window.__i18nRerender = window.__i18nRerender || [];
window.__i18nRerender.push(() => {
  document.querySelectorAll('[data-cc-edittoggle]').forEach(b => {
    b.textContent = b.textContent.includes('👁') ? t('codecards.view') : t('codecards.edit');
  });
  document.querySelectorAll('[id^="cc-header-"]').forEach(el => {
    const cardId = el.id.slice('cc-header-'.length);
    const card = (window._codeCards||[]).find(c => c.cardId === cardId); if (!card) return;
    const files = (card.files||[]).filter(f => !f.filename.endsWith('.gitkeep'));
    el.innerHTML = files.length > 1
      ? `✅ ${t('codecards.filesGenerated').replace('{n}', files.length)}`
      : `✅ 📄 ${escHtml(files[0]?.filename||'')}`;
  });
});

function renderResultCard(files, existingCardId) {
  const cardId  = existingCardId || ('result-' + Date.now());
  const isMulti = files.length > 1;
  let activeTab = 0;

  const div = document.createElement('div');
  div.className = 'msg agent';
  div.id = cardId;
  document.getElementById('messages').appendChild(div);

  function buildCard(active) {
    const tabsHtml = isMulti ? files.map((f, i) =>
      `<button data-ridx="${i}" data-card="${cardId}" data-raction="tab"
        style="padding:8px 14px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer;
        border:none;border-bottom:2px solid ${i===active ? 'var(--teal)' : 'transparent'};
        color:${i===active ? 'var(--teal)' : 'var(--gray)'};background:transparent;white-space:nowrap;transition:all .15s">
        📄 ${escHtml(f.filename.split('/').pop())}
      </button>`
    ).join('') : '';

    const f    = files[active];
    const rawCode = cleanRobotCodeFromHtml(f.code);
    const safe = escHtml(rawCode);
    // Fichier binaire (image/PDF) : NE PAS afficher le base64 en texte ni le linter -> aperçu/placeholder.
    const isBinary = !!f.binary;
    const isRf = !isBinary && /\.(robot|resource)$/i.test(f.filename || '');
    let hl;
    if (isBinary) {
      const _kb   = Math.round((String(f.code||'').length * 0.75) / 1024);
      const _name = escHtml((f.filename||'').split('/').pop());
      hl = f.isImage
        ? `<img src="${f.code}" alt="${_name}" style="max-width:100%;max-height:320px;border-radius:6px;display:block;margin:8px auto"/><div style="text-align:center;color:var(--gray);font-size:12px;margin-top:6px">🖼️ ${_name} · ${_kb} Ko</div>`
        : `<div style="padding:32px;text-align:center;color:var(--gray);font-size:13px">📎 ${_name}<div style="font-size:12px;margin-top:6px">fichier binaire · ${_kb} Ko</div></div>`;
    } else {
      hl = isRf ? syntaxHLLinted(rawCode) : syntaxHL(safe);
    }

    // Multi-file run selector
    const runSelector = isMulti ? `
      <select data-card="${cardId}" data-raction="runselect"
        style="background:var(--code);border:1px solid var(--border);border-radius:5px;color:var(--text);font-family:'IBM Plex Mono',monospace;font-size:11px;padding:5px 8px;outline:none;min-width:160px">
        <option value="all" data-i18n="codecards.runAll">▶ Tous les fichiers</option>
        ${files.map((f,i) => `<option value="${i}">▶ ${escHtml(f.filename.split('/').pop())}</option>`).join('')}
      </select>` : '';

    const editId = cardId + '-edit-' + active;

    // Drag carte-vers-suite retiré (redondant avec la modale _suitePickerModal ;
    // causait l'insertion %20/%0A en sélectionnant du texte dans le code).

    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body" style="width:100%;max-width:98vw">
        <div class="msg-bubble" style="padding:0;overflow:hidden;min-width:340px;max-width:100%;width:100%;box-sizing:border-box;resize:both;overflow:auto;min-height:200px">

          <!-- Card header -->
          <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:var(--card);border-bottom:1px solid var(--border);flex-wrap:wrap">
            <span style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--teal);font-weight:600">
              <span id="cc-header-${cardId}">✅ ${isMulti ? t('codecards.filesGenerated').replace('{n}', files.length) : '📄 ' + escHtml(f.filename)}</span>
            </span>
            ${(() => {
              const card = (window._codeCards||[]).find(c => c.cardId === cardId);
              const t = card?.title || window._lastGeneratedTitle || '';
              return t ? '<span style="background:rgba(0,212,170,0.12);border:1px solid var(--teal);color:var(--teal);font-family:\'IBM Plex Mono\',monospace;font-size:10px;padding:2px 9px;border-radius:10px;white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis" title="' + escHtml(t) + '">🏷️ ' + escHtml(t) + '</span>' : '';
            })()}
            <div style="display:flex;gap:4px;flex-wrap:nowrap;align-items:center;flex-shrink:0;margin-left:auto">
              ${runSelector}
              <button data-card="${cardId}" data-raction="toggleedit" data-cc-edittoggle data-i18n-title="codecards.tEditCode"
                style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);color:#60a5fa;padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Éditer le code">${t('codecards.edit')}</button>
              <button data-card="${cardId}" data-raction="run" data-i18n="codecards.run"
                style="background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#07090f;
                       padding:6px 14px;border-radius:6px;font-size:11px;font-family:'IBM Plex Mono',monospace;
                       font-weight:700;cursor:pointer;white-space:nowrap">
                ▶️ Run
              </button>
              <button data-card="${cardId}" data-raction="copy" data-i18n-title="codecards.tCopy"
                style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">📋</button>
              <button data-card="${cardId}" data-raction="download" data-i18n-title="codecards.tDownload"
                style="background:rgba(245,158,11,0.08);border:1px solid var(--warn);color:var(--warn);padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">⬇️</button>
              ${isMulti ? `<button data-card="${cardId}" data-raction="downloadall" data-i18n="codecards.downloadAll" data-i18n-title="codecards.tDownloadAll"
                style="background:rgba(59,130,246,0.08);border:1px solid #60a5fa;color:#60a5fa;padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">⬇️ Tout</button>` : ''}
              <button id="tagBtn-${cardId}" onclick="toggleCardTag('${cardId}')" data-i18n="codecards.tag" data-i18n-title="codecards.tTag"
                style="background:rgba(0,0,0,0.06);border:1px solid var(--border);color:var(--gray);padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">Tag</button>
              <button data-card="${cardId}" data-raction="zoom-in" data-i18n-title="codecards.tZoomIn"
                style="background:rgba(0,212,170,0.06);border:1px solid var(--border);color:var(--gray);padding:4px 8px;border-radius:5px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer">＋</button>
              <button data-card="${cardId}" data-raction="zoom-out" data-i18n-title="codecards.tZoomOut"
                style="background:rgba(0,212,170,0.06);border:1px solid var(--border);color:var(--gray);padding:4px 8px;border-radius:5px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer">－</button>
              <button data-card="${cardId}" data-raction="reset" data-i18n-title="codecards.tReset"
                style="background:rgba(230,57,70,0.08);border:1px solid var(--red);color:var(--red);padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">✕</button>
            </div>
          </div>

          <!-- Layout: tree sidebar + code area -->
          <div style="display:flex;min-height:360px;flex:1">

            <!-- File tree (multi only) -->
            ${isMulti ? `<div style="width:200px;min-width:140px;flex-shrink:0;background:#060a10;border-right:1px solid var(--border);padding:10px 0;overflow-y:auto;resize:horizontal;overflow:auto"
  ondragover="event.preventDefault()"
  ondrop="treeDropToFolder(event,'','${cardId}')">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:0 8px 8px;border-bottom:1px solid var(--border);margin-bottom:6px">
                <span data-i18n="codecards.tree" style="font-size:9px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px">ARBORESCENCE</span>
                <label data-i18n-title="codecards.tImport" title="Importer .robot .py .png .jpg"
                  style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);
                         padding:2px 8px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
                  <span data-i18n="codecards.import">⬆ Import</span>
                  <input type="file" multiple accept=".robot,.py,.png,.jpg,.jpeg,.pdf,.txt,.csv,.xls,.xlsx"
                    style="display:none"
                    onchange="treeHandleUpload(event,'${cardId}')" />
                </label>
              </div>
              ${buildFileTree(files, activeTab, cardId)}
            </div>` : ''}

            <!-- Code area -->
            <div style="flex:1;min-width:0;display:flex;flex-direction:column">
              <!-- Search bar -->
              <div id="${editId}-search" style="display:none;padding:6px 10px;background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">
                <input id="${editId}-search-input" data-i18n-ph="codecards.searchPh" placeholder="🔍 Rechercher…" type="text"
                  style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:5px;
                         color:var(--text);font-family:'IBM Plex Mono',monospace;font-size:12px;padding:4px 8px;outline:none"
                  oninput="searchInCode('${editId}', this.value)"
                  onkeydown="if(event.key==='Escape'){document.getElementById('${editId}-search').style.display='none';document.getElementById('${editId}-search-input').value='';searchInCode('${editId}','')}" />
                <span id="${editId}-search-count" style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;white-space:nowrap"></span>
                <button onclick="navigateSearch('${editId}',-1)" style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:14px" data-i18n-title="codecards.tPrev" title="Précédent">▲</button>
                <button onclick="navigateSearch('${editId}',1)"  style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:14px" data-i18n-title="codecards.tNext" title="Suivant">▼</button>
                <button onclick="document.getElementById('${editId}-search').style.display='none';searchInCode('${editId}','')"
                  style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:14px">✕</button>
              </div>
              <!-- Code view (read) -->
              <div id="${editId}-view" style="flex:1;position:relative;overflow:hidden;display:flex;flex-direction:column"
                onkeydown="if((event.ctrlKey||event.metaKey)&&event.key==='f'){event.preventDefault();const s=document.getElementById('${editId}-search');s.style.display='flex';document.getElementById('${editId}-search-input').focus()}"
                tabindex="0">
                <pre id="${editId}-pre" style="padding:14px;font-family:'IBM Plex Mono',monospace;font-size:${(window._codeFontSize&&window._codeFontSize[cardId])||13}px;line-height:1.75;color:#7dd3c8;overflow:auto;min-height:320px;height:100%;resize:vertical;white-space:pre;margin:0;flex:1">${hl}</pre>
              </div>

              <!-- Code editor (hidden by default) -->
              <div id="${editId}-editor" style="display:none;flex:1;flex-direction:column">
                <textarea id="${editId}-ta"
                  style="flex:1;width:100%;min-height:320px;background:var(--code);border:none;color:#7dd3c8;
                         font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.75;
                         padding:14px;outline:none;resize:vertical;box-sizing:border-box;white-space:pre;overflow-x:auto"
                  spellcheck="false"${isBinary ? ' readonly' : ''}>${isBinary ? '' : escHtml(rawCode)}</textarea>
                <div style="display:flex;gap:8px;padding:10px 14px;background:var(--card);border-top:1px solid var(--border)">
                  <button data-card="${cardId}" data-raction="applyedit" data-editid="${editId}" data-i18n="codecards.apply"
                    style="background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;padding:8px 18px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
                    ✅ Appliquer
                  </button>
                  <button data-card="${cardId}" data-raction="canceledit" data-editid="${editId}" data-i18n="codecards.cancel"
                    style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:8px 14px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
                    Annuler
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>`;

    // Synchronise le chrome (data-i18n / -ph / -title) à la langue courante dès le rendu
    if (window.applyI18n) applyI18n(div);

    // Event delegation
    div.onclick = async e => {
      const btn = e.target.closest('[data-raction]');
      if (!btn) return;
      const action = btn.dataset.raction;
      if (btn.dataset.card) {
        try {
          const selRF = document.querySelector('select[data-raction="runselect"][data-card="' + btn.dataset.card + '"]');
          let sfRF = null;
          if (selRF && selRF.value !== 'all') {
            const cardRF = (window._codeCards || []).find(c => c.cardId === btn.dataset.card);
            const fRF = cardRF && cardRF.files && cardRF.files[Number(selRF.value)];
            const fnRF = fRF ? String(fRF.filename || '') : '';
            if (fnRF.indexOf('tests/') === 0 && !fnRF.endsWith('__init__.robot')) {
              sfRF = fnRF.split('/').pop().replace(/\.robot$/i, '');
            }
          }
          window._runSuiteFilter = sfRF;
        } catch (eRF) { window._runSuiteFilter = null; }
      }
      if (action === 'folder-rename') {
        treeFolderRename(e, btn.dataset.folder, cardId);
      } else if (action === 'folder-delete') {
        treeFolderDelete(e, btn.dataset.folder, cardId);
      } else if (action === 'file-rename') {
        treeRename(e, parseInt(btn.dataset.ridx), cardId);
      } else if (action === 'file-delete') {
        treeDelete(e, parseInt(btn.dataset.ridx), cardId);
      } else if (action === 'tab') {
        activeTab = parseInt(btn.dataset.ridx);
        buildCard(activeTab);
      } else if (action === 'toggleedit') {
        const eid   = cardId + '-edit-' + activeTab;
        const view  = document.getElementById(eid + '-view');
        const editor= document.getElementById(eid + '-editor');
        if (!view || !editor) return;
        const isEditing = editor.style.display !== 'none';
        view.style.display   = isEditing ? 'block' : 'none';
        editor.style.display = isEditing ? 'none'  : 'block';
        btn.textContent = isEditing ? t('codecards.edit') : t('codecards.view');
      } else if (action === 'applyedit') {
        const eid = btn.dataset.editid;
        const ta  = document.getElementById(eid + '-ta');
        if (!ta) return;
        // Fichier binaire (image/PDF) : non éditable -> ne pas écraser le base64
        if (files[activeTab] && files[activeTab].binary) { showToast(t('editor.binaryNoEdit')); return; }
        // Update files array with new code
        files[activeTab].code = ta.value;
        // Persist in _codeCards
        window._codeCards = (window._codeCards||[]).map(c => {
          if (c.cardId !== cardId) return c;
          const newFiles = [...(c.files||[])];
          if (newFiles[activeTab]) newFiles[activeTab] = { ...newFiles[activeTab], code: ta.value };
          return { ...c, files: newFiles };
        });
        // Persister dans PulledBlock si ce bloc vient d'un pull CI/CD
        (async () => {
          try {
            const chk = await fetch('/api/pulledblocks/' + encodeURIComponent(cardId) + '?check=1');
            // on fait un PATCH silencieux (la route GET n'existe pas, on tente PATCH directement)
          } catch(e){}
          const updCard = (window._codeCards||[]).find(x => x.cardId === cardId);
          if (updCard) _patchPulledBlock(cardId, { files: updCard.files.map(f=>({filename:f.filename,code:f.code,label:f.label||''})) });
        })();
        // Persister dans PulledBlock si ce bloc vient d'un pull CI/CD
        (async () => {
          try {
            const chk = await fetch('/api/pulledblocks/' + encodeURIComponent(cardId) + '?check=1');
            // on fait un PATCH silencieux (la route GET n'existe pas, on tente PATCH directement)
          } catch(e){}
          const updCard = (window._codeCards||[]).find(x => x.cardId === cardId);
          if (updCard) _patchPulledBlock(cardId, { files: updCard.files.map(f=>({filename:f.filename,code:f.code,label:f.label||''})) });
        })();
        window._lastGeneratedCode = ta.value;
        localStorage.setItem('qa_last_code', ta.value);
        saveCodeCards(); // persiste dans MongoDB + localStorage
        // Mettre à jour suiteRegistry si ce bloc est dans une suite
        const regEntry = suiteRegistry.find(t => t.cardId === cardId);
        if (regEntry) { regEntry.code = ta.value; saveSuiteRegistry(); }
        // Écrire le fichier sur disque (sync UI → VS Code) — await pour garantir l'ordre
        const editedFile = files[activeTab];
        if (editedFile?.filename) {
          try {
            await fetch(window._runnerBase + '/api/rf/write-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filepath: editedFile.filename, content: ta.value }),
            });
          } catch(e) {}
        }
        // Re-render card to update syntax highlight
        buildCard(activeTab);
        showToast(t('codecards.codeUpdated'));
      } else if (action === 'canceledit') {
        const eid    = btn.dataset.editid;
        const view   = document.getElementById(eid + '-view');
        const editor = document.getElementById(eid + '-editor');
        if (view)   view.style.display   = 'block';
        if (editor) editor.style.display = 'none';
        btn.closest('[data-raction="canceledit"]');
        // Reset button text
        const editBtn = div.querySelector('[data-raction="toggleedit"]');
        if (editBtn) editBtn.textContent = '✏️ Éditer';
      } else if (action === 'run') {
        const sel = div.querySelector('[data-raction="runselect"]');
        const val = sel ? sel.value : 'all';
        let filesToRun;
        if (!sel || val === 'all') {
          filesToRun = files;
        } else {
          filesToRun = [files[parseInt(val)]];
        }
        // For multi-file POM: send combined code WITH delimiters so server can split
        let combined, fname;
        if (filesToRun.length > 1) {
          // Always send ALL files with FILE: delimiters so server writes them all to disk.
          // Fichiers binaires (images) -> marqueur ` | BINARY` ; f.code = dataURL base64.
          combined = filesToRun.map(f =>
            '***** FILE: ' + f.filename + ' | ' + (f.label || f.filename.split('/').pop().replace('.robot','')) + ' | ' + (f.desc || f.filename) + (f.binary ? ' | BINARY' : '') + '\n' + f.code
          ).join('\n');
          fname = 'tests/tests';
        } else {
          combined = filesToRun[0].code;
          fname    = filesToRun[0].filename;
        }
        window._lastCardId = cardId;
        runTestsFromCard(combined, fname);
      } else if (action === 'copy') {
        navigator.clipboard.writeText(files[activeTab].code)
          .then(() => showToast(t('codecards.copied')));
      } else if (action === 'download') {
        dlFile(files[activeTab].filename, files[activeTab].code);
      } else if (action === 'downloadall') {
        downloadAsZip(files, cardId);
      } else if (action === 'zoom-in' || action === 'zoom-out') {
        if (!window._codeFontSize) window._codeFontSize = {};
        const cur = window._codeFontSize[cardId] || 13;
        const next = action === 'zoom-in' ? Math.min(cur + 1, 22) : Math.max(cur - 1, 10);
        window._codeFontSize[cardId] = next;
        // Appliquer à tous les pre et textarea du bloc
        const el2 = document.getElementById(cardId);
        if (el2) {
          el2.querySelectorAll('pre').forEach(p => p.style.fontSize = next + 'px');
          el2.querySelectorAll('textarea').forEach(t => t.style.fontSize = next + 'px');
        }
      } else if (action === 'reset') {
        const card = (window._codeCards||[]).find(c => c.cardId === cardId);
        const blockTitle = card?.title || (files[0]?.filename || 'ce bloc');
        showConfirmDialog(t('codecards.deleteBlockTitle'), t('codecards.deleteBlockBody').replace('{name}', escHtml(blockTitle)), () => {
          window._codeCards = (window._codeCards||[]).filter(c => c.cardId !== cardId);
          // Remove from suiteRegistry
          suiteRegistry = (suiteRegistry||[]).filter(t => t.cardId !== cardId);
          saveSuiteRegistry();
          // Remove from savedSuites testIds
          savedSuites.forEach(s => { s.testIds = (s.testIds||[]).filter(id => suiteRegistry.some(t => t.id === id)); });
          saveSuitesList();
          // Retirer du tag
          if (window._taggedCards) window._taggedCards.delete(cardId);
          // Retirer les marqueurs [RF code: ...] liés à ce bloc du chatHistory
          const _cardFiles = card ? (card.files||[]).map(f => f.filename) : [];
          if (_cardFiles.length) {
            chatHistory = chatHistory.filter(function(m){
              if (!m.content.startsWith('[RF code:')) return true;
              // Vérifier si ce marqueur correspond aux fichiers du bloc supprimé
              return !_cardFiles.some(function(fn){ return m.content.includes(fn); });
            });
            LS.save();
          }
          saveCodeCards();
          deleteFromDB(cardId);
          div.remove();
        });
      }
    };
  }

  buildCard(0);

  chatHistory.push({ role: 'assistant', content: '[RF code: ' + files.map(f => f.filename).join(', ') + ']' });
  LS.save();
  scrollToBottom();
}
