// ============================================================================
// editor.js — arbre de fichiers (mutation/hover), ZIP, recherche dans le code,
//             fusion de cartes. Extrait de qa-agent.js.
// ============================================================================

// Show/hide tree action buttons on hover
document.addEventListener('mouseover', e => {
  const row = e.target.closest('.tree-file-row');
  if (row) { const a = row.querySelector('.tree-actions'); if (a) a.style.display='flex'; }
  const folder = e.target.closest('.tree-folder-row');
  if (folder) { const a = folder.querySelector('.tree-folder-actions'); if (a) a.style.display='flex'; }
});
document.addEventListener('mouseout', e => {
  const row = e.target.closest('.tree-file-row');
  if (row && !row.contains(e.relatedTarget)) { const a = row.querySelector('.tree-actions'); if (a) a.style.display='none'; }
  const folder = e.target.closest('.tree-folder-row');
  if (folder && !folder.contains(e.relatedTarget)) { const a = folder.querySelector('.tree-folder-actions'); if (a) a.style.display='none'; }
});


// ── Upload files into code card tree ─────────────────────────────────────────
async function treeHandleUpload(event, cardId) {
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card) return;
  const uploadedFiles = [...event.target.files];
  if (!uploadedFiles.length) return;

  let count = 0;
  for (const file of uploadedFiles) {
    const name = file.name;
    const ext  = name.split('.').pop().toLowerCase();

    // Check if file already exists
    if (card.files.find(f => f.filename.endsWith('/' + name) || f.filename === name)) {
      showConfirmDialog(t('editor.fileExistsTitle'), t('editor.fileExistsBody').replace('{name}', escHtml(name)), async () => {
        await readAndAddFile(file, name, ext, card, true);
        saveCodeCards();
        const el = document.getElementById(cardId);
        if (el) { el.remove(); renderResultCard(card.files, cardId); }
      });
      continue;
    }

    await readAndAddFile(file, name, ext, card, false);
    count++;
  }

  if (count > 0) {
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast(t('editor.imported').replace('{n}', count));
  }

  // Reset input
  event.target.value = '';
}

async function readAndAddFile(file, name, ext, card, replace) {
  const isImage = ['png','jpg','jpeg'].includes(ext);
  const content = await new Promise(res => {
    const r = new FileReader();
    if (isImage) {
      r.onload = () => res(r.result); // base64 data URL
      r.readAsDataURL(file);
    } else {
      r.onload = () => res(r.result);
      r.readAsText(file);
    }
  });

  // Determine folder based on extension
  let filename = name;
  if (!replace) {
    if (ext === 'robot') {
      // Try to guess folder from content
      if (content.includes('*** Test Cases ***')) filename = 'tests/' + name;
      else if (content.includes('*** Keywords ***'))  filename = 'resources/' + name;
      else filename = 'resources/' + name;
    } else if (ext === 'py') {
      filename = 'libraries/' + name;
    } else if (isImage) {
      filename = 'screenshots/' + name;
    }
  }

  if (replace) {
    const existing = card.files.find(f => f.filename.endsWith('/' + name) || f.filename === name);
    if (existing) { existing.code = content; existing.isImage = isImage; return; }
  }

  card.files.push({ filename, code: content, isImage: isImage || false });
}


// ── Drop code card into suite group ──────────────────────────────────────────
function dropCardToSuite(event, groupId) {
  event.preventDefault();
  event.currentTarget.style.borderColor = 'var(--border)';
  event.currentTarget.style.background = '';

  // Try drag data from code card
  try {
    const raw  = event.dataTransfer.getData('application/x-rf-card');
    if (raw) {
      const data = JSON.parse(raw);
      const code = decodeURIComponent(data.code);
      const filename = data.filename || 'test_dropped.robot';
      const name = (data.name || filename.replace('.robot','').replace(/_/g,' ')).replace(/\b\w/g, c => c.toUpperCase());
      const id = generateSuiteId();
      suiteRegistry.push({ id, cardId: data.cardId, groupId, name, filename, code, addedAt: new Date().toISOString(), droppedIntoGroup: true });
      saveSuiteRegistry();
      renderSavedSuites();
      renderSuiteTestList();
      showToast(t('editor.addedToSuite').replace('{name}', name));
      return;
    }
  } catch(e) {}

  // Try cardId from tree drag
  if (window._treeDrag?.cardId) {
    const card = (window._codeCards||[]).find(c => c.cardId === window._treeDrag.cardId);
    if (card) {
      addCardToSuite(card.cardId);
      window._treeDrag = null;
    }
  }
}

// ── Add folder ───────────────────────────────────────────────────────────────
function treeAddFolder(parentFolder, cardId) {
  showInputDialog(t('editor.newFolderTitle'), t('editor.newFolderLabel'), '', name => {
    if (!name?.trim()) return;
    const folderPath = parentFolder ? parentFolder + '/' + name.trim() : name.trim();
    const card = (window._codeCards||[]).find(c => c.cardId === cardId);
    if (!card) return;
    // Create a placeholder .gitkeep file to materialize the folder
    const keepFile = folderPath + '/.gitkeep';
    if (card.files.find(f => f.filename === keepFile)) { showToast(t('editor.folderExists')); return; }
    card.files.push({ filename: keepFile, code: '# placeholder' });
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast(t('editor.folderCreated').replace('{path}', folderPath));
  });
}

// ── Add file ──────────────────────────────────────────────────────────────────
function treeAddFile(folder, cardId) {
  showInputDialog(t('editor.newFileTitle'), t('editor.newFileLabel'), '', name => {
    if (!name?.trim()) return;
  const fullPath = folder ? folder + '/' + name.trim() : name.trim();
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card) return;
    card.files.push({ filename: fullPath, code: '*** Settings ***\n\n*** Keywords ***\n\n' });
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast(t('editor.fileCreated').replace('{path}', fullPath));
  });
}

// ── Rename file ───────────────────────────────────────────────────────────────
function treeRename(e, idx, cardId) {
  e.stopPropagation();
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card?.files?.[idx]) return;
  const oldPath = card.files[idx].filename;
  const oldName = oldPath.split('/').pop();
  showInputDialog(t('editor.renameTitle'), t('editor.renameLabel'), oldName, newName => {
    if (!newName?.trim() || newName.trim() === oldName) return;
    const parts = oldPath.split('/');
    parts[parts.length-1] = newName.trim();
    card.files[idx].filename = parts.join('/');
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast(t('editor.renamed').replace('{name}', newName.trim()));
  });
}

// ── Delete file ───────────────────────────────────────────────────────────────
function treeDelete(e, idx, cardId) {
  e.stopPropagation();
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card?.files?.[idx]) return;
  showConfirmDialog(t('editor.deleteTitle'), t('editor.deleteBody').replace('{name}', escHtml(card.files[idx].filename)), () => {
    card.files.splice(idx, 1);
    saveCodeCards();
    deleteFromDB(cardId); // re-sauvegarde la version mise à jour
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast(t('editor.fileDeleted'));
  });
}

// ── Drag file to folder ───────────────────────────────────────────────────────
function treeDropToFolder(e, targetFolder, cardId) {
  e.preventDefault();
  e.stopPropagation();
  if (!window._treeDrag || window._treeDrag.cardId !== cardId) return;
  const drag = window._treeDrag;
  window._treeDrag = null;
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card) return;

  if (drag.folder !== undefined) {
    // Moving a folder into another folder
    const srcFolder = drag.folder;
    if (targetFolder === srcFolder || targetFolder.startsWith(srcFolder + '/')) {
      showToast(t('editor.cantMoveInto')); return;
    }
    const srcName = srcFolder.split('/').pop();
    const newBase = targetFolder ? targetFolder + '/' + srcName : srcName;
    card.files = card.files.map(f => ({
      ...f,
      filename: f.filename.startsWith(srcFolder + '/')
        ? newBase + f.filename.slice(srcFolder.length)
        : f.filename
    }));
    showToast(t('editor.folderMoved').replace('{dest}', targetFolder || t('editor.root')));
  } else if (drag.idx !== undefined) {
    // Moving a file into a folder
    const file = card.files[drag.idx];
    if (!file) return;
    const fname = file.filename.split('/').pop();
    file.filename = targetFolder ? targetFolder + '/' + fname : fname;
    showToast(t('editor.fileMoved').replace('{dest}', targetFolder || t('editor.root')));
  }

  saveCodeCards();
  const el = document.getElementById(cardId);
  if (el) { el.remove(); renderResultCard(card.files, cardId); }
}

// ── Save helper ───────────────────────────────────────────────────────────────









// ── Télécharger tous les fichiers en ZIP ─────────────────────────────────────
async function downloadAsZip(files, cardId) {
  // Charger JSZip dynamiquement
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const zip = new JSZip();
  files.forEach(f => {
    if (f.filename.endsWith('.gitkeep')) return;
    zip.file(f.filename, f.code || '');
  });
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  const zipName = (card?.title || 'rf_tests').replace(/[^a-z0-9_-]/gi, '_').toLowerCase() + '.zip';
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = zipName;
  a.click();
  showToast(t('editor.zipDownloaded').replace('{n}', files.filter(f => !f.filename.endsWith('.gitkeep')).length));
}

function dlFile(filename, code) {
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(code);
  a.download = filename.split('/').pop();
  a.click();
}
// ── Code search in result card ────────────────────────────────────────────────
const _searchState = {};

function searchInCode(editId, query) {
  const pre = document.getElementById(editId + '-pre');
  const countEl = document.getElementById(editId + '-search-count');
  if (!pre) return;

  if (!query) {
    // Restore original highlighted content
    if (_searchState[editId]?.original) {
      pre.innerHTML = _searchState[editId].original;
    }
    if (countEl) countEl.textContent = '';
    _searchState[editId] = null;
    return;
  }

  // Save original if first search
  if (!_searchState[editId]?.original) {
    _searchState[editId] = { original: pre.innerHTML, idx: 0 };
  }

  // Highlight matches in plain text
  const plain = pre.textContent;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(' + escaped + ')', 'gi');
  const matches = [...plain.matchAll(re)];

  if (countEl) countEl.textContent = matches.length ? t('editor.searchCount').replace('{n}', matches.length) : t('editor.searchNone');

  // Highlight in innerHTML (escape HTML first)
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  pre.innerHTML = esc(plain).replace(
    new RegExp('(' + escaped + ')', 'gi'),
    '<mark style="background:rgba(245,158,11,0.4);color:var(--text);border-radius:2px">$1</mark>'
  );

  _searchState[editId].matches = matches.length;
  _searchState[editId].idx = 0;
  navigateSearch(editId, 0);
}

function navigateSearch(editId, dir) {
  const s = _searchState[editId];
  if (!s || !s.matches) return;
  const marks = document.getElementById(editId + '-pre')?.querySelectorAll('mark');
  if (!marks?.length) return;
  s.idx = ((s.idx + dir) % marks.length + marks.length) % marks.length;
  marks.forEach((m, i) => {
    m.style.background = i === s.idx ? 'rgba(245,158,11,0.8)' : 'rgba(245,158,11,0.4)';
  });
  marks[s.idx].scrollIntoView({ block: 'center', behavior: 'smooth' });
}

// Global Ctrl+F intercept on result cards
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    // Find visible pre
    const pres = document.querySelectorAll('[id$="-pre"]');
    for (const pre of pres) {
      const rect = pre.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight + 200) {
        const editId = pre.id.replace('-pre', '');
        const searchBar = document.getElementById(editId + '-search');
        if (searchBar) {
          e.preventDefault();
          searchBar.style.display = 'flex';
          document.getElementById(editId + '-search-input')?.focus();
          return;
        }
      }
    }
  }
});


// ── Code card merge selector ──────────────────────────────────────────────────
function openCodeMergeSelector(targetCardId, targetFiles) {
  // Find all other result cards in DOM
  const allCodeDivs = [...document.querySelectorAll('.msg.agent[id^="result-"]')]
    .filter(d => d.id !== targetCardId);
  const allCards = allCodeDivs.map(d => {
    const stored = (window._codeCards||[]).find(c => c.cardId === d.id);
    if (stored) return stored;
    // Fallback: build from DOM
    const titleEl = d.querySelector('[title]');
    return { cardId: d.id, title: titleEl?.title || d.id, files: [] };
  }).filter(c => c.cardId);

  if (allCards.length === 0) { showToast(t('editor.mergeNoOther')); return; }

  document.getElementById('codeMergeModal')?.remove();
  window._codeMergeCards = allCards; // store for mergeCodeCards
  const modal = document.createElement('div');
  modal.id = 'codeMergeModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';

  const rows = allCards.map((card, i) => {
    const title = card.title || card.cardId;
    const fileList = (card.files||[]).map(f => f.filename.split('/').pop()).join(', ');
    return `<label style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--card);
              border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer"
              onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
      <input type="checkbox" value="${i}" class="code-merge-cb"
        style="accent-color:var(--teal);width:16px;height:16px;flex-shrink:0;margin-top:4px;cursor:pointer" />
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--teal);margin-bottom:4px">🏷️ ${escHtml(title)}</div>
        <div style="font-size:11px;color:var(--text);font-family:'IBM Plex Mono',monospace;margin-bottom:2px">${escHtml(fileList)}</div>
        <div style="font-size:10px;color:var(--gray)">${t('editor.filesCount').replace('{n}', (card.files||[]).length)}</div>
      </div>
    </label>`;
  }).join('');

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:500px">
      <div style="display:flex;align-items:center;padding:16px 20px;background:var(--card);border-bottom:1px solid var(--border)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">${t('editor.mergeTitle')}</span>
        <button onclick="document.getElementById('codeMergeModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="padding:16px 20px;max-height:320px;overflow-y:auto">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:12px">
          ${t('editor.mergeHeader')}
        </div>
        ${rows}
      </div>
      <div style="display:flex;gap:10px;padding:14px 20px;border-top:1px solid var(--border);background:var(--card)">
        <button id="codeMergeConfirmBtn""
          style="flex:1;background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;
                 padding:10px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          ${t('editor.mergeBtn')}
        </button>
        <button onclick="document.getElementById('codeMergeModal').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:10px 16px;
                 border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          ${t('editor.mergeCancel')}
        </button>
      </div>
    </div>`;

  // Store allCards ref for merge
  modal._allCards = allCards;
  document.body.appendChild(modal);

  // Wire confirm button safely
  document.getElementById('codeMergeConfirmBtn')?.addEventListener('click', () => {
    mergeCodeCards(targetCardId);
  });
}

function mergeCodeCards(targetCardId) {
  const checked = [...document.querySelectorAll('.code-merge-cb:checked')];
  if (checked.length === 0) { showToast(t('editor.mergeCheckOne')); return; }

  const targetCard = (window._codeCards||[]).find(c => c.cardId === targetCardId);
  if (!targetCard) { showToast(t('editor.mergeTargetMissing')); return; }

  // Use cards stored when modal was opened (same order as checkboxes)
  const allCards = window._codeMergeCards || [];

  checked.forEach(cb => {
    const idx = parseInt(cb.value);
    const srcCard = allCards[idx];
    if (!srcCard || !srcCard.files?.length) return;

    // Merge files — tests.robot → feature_<titre>.robot séparé
    const existingFiles = new Set(targetCard.files.map(f => f.filename));
    srcCard.files.forEach(f => {
      if (f.filename === 'tests/tests.robot') {
        // Créer un fichier feature_*.robot séparé pour ce bloc source
        const featureName = 'tests/feature_' + (srcCard.title||'tests').toLowerCase()
          .replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').slice(0,30) + '.robot';
        if (!existingFiles.has(featureName)) {
          targetCard.files.push({ ...f, filename: featureName, label: srcCard.title });
          existingFiles.add(featureName);
        }
      } else if (!existingFiles.has(f.filename)) {
        targetCard.files.push({ ...f });
        existingFiles.add(f.filename);
      } else {
        // Merger les ressources (keywords, pages) — pas les tests
        const existing = targetCard.files.find(ef => ef.filename === f.filename);
        if (existing) existing.code = mergeRobotFiles(existing.code, f.code);
      }
    });

    // Remove source card
    document.getElementById(srcCard.cardId)?.remove();
    window._codeCards = (window._codeCards||[]).filter(c => c.cardId !== srcCard.cardId);
  });

  // Update title
  if (checked.length > 0) {
    const newTitles = [targetCard.title, ...checked.map(cb => allCards[parseInt(cb.value)]?.title).filter(Boolean)];
    targetCard.title = [...new Set(newTitles)].join(' + ');
    window._lastGeneratedTitle = targetCard.title;
  }

  // Renommer tests.robot de la cible en feature_<titre>.robot
  const targetTestsFile = targetCard.files.find(f => f.filename === 'tests/tests.robot');
  if (targetTestsFile && checked.length > 0) {
    const featureName = 'tests/feature_' + (targetCard.title||'tests').toLowerCase()
      .replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').slice(0,30) + '.robot';
    targetTestsFile.filename = featureName;
  }
  // Renumber TC_XXX sequentially in all feature_*.robot files
  targetCard.files = targetCard.files.map(f => {
    if (!f.filename.startsWith('tests/feature_') && !f.filename.includes('tests.robot')) return f;
    let counter = 1;
    const code = f.code.replace(/^(TC_\d+)( .+)$/gm, (m, tc, name) => {
      const newId = 'TC_' + String(counter++).padStart(3, '0');
      return newId + name;
    });
    return { ...f, code };
  });

  // Re-render target card
  const targetEl = document.getElementById(targetCardId);
  if (targetEl) {
    targetEl.remove();
    renderResultCard(targetCard.files, targetCardId);
  }

  try { localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards)); } catch(e) {}
  document.getElementById('codeMergeModal')?.remove();
  showToast(t('editor.blocksMerged').replace('{n}', checked.length));
}

function mergeRobotFiles(code1, code2) {
  // Merge two Robot Framework files — combine Keywords and Test Cases sections
  const sections = ['*** Settings ***', '*** Variables ***', '*** Keywords ***', '*** Test Cases ***'];
  let result = code1;

  sections.forEach(section => {
    if (!code2.includes(section)) return;
    const start2 = code2.indexOf(section);
    const nextSection = sections.find(s => s !== section && code2.indexOf(s, start2 + section.length) > start2);
    const end2 = nextSection ? code2.indexOf(nextSection, start2 + section.length) : code2.length;
    const content2 = code2.slice(start2 + section.length, end2).trim();
    if (!content2) return;

    if (result.includes(section)) {
      // Append to existing section
      const start1 = result.indexOf(section);
      const nextSec1 = sections.find(s => s !== section && result.indexOf(s, start1 + section.length) > start1);
      const insertPos = nextSec1 ? result.indexOf(nextSec1, start1 + section.length) : result.length;
      result = result.slice(0, insertPos) + '\n' + content2 + '\n\n' + result.slice(insertPos);
    } else {
      result += '\n\n' + section + '\n' + content2;
    }
  });

  return result;
}

// ── Folder rename ─────────────────────────────────────────────────────────────
function treeFolderRename(e, folder, cardId) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const oldName = folder.split('/').pop();
  showInputDialog(t('editor.folderRenameTitle'), t('editor.renameLabel'), oldName, newName => {
    if (!newName?.trim() || newName.trim() === oldName) return;
    const card = (window._codeCards||[]).find(c => c.cardId === cardId);
    if (!card) return;
    const prefix = folder.includes('/') ? folder.slice(0, folder.lastIndexOf('/') + 1) : '';
    const newFolder = prefix + newName.trim();
    card.files = card.files.map(f => ({
      ...f,
      filename: f.filename.startsWith(folder + '/')
        ? newFolder + f.filename.slice(folder.length)
        : f.filename
    }));
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast(t('editor.folderRenamed').replace('{name}', newName.trim()));
  });
}

// ── Folder delete ─────────────────────────────────────────────────────────────
function treeFolderDelete(e, folder, cardId) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card) return;
  const count = card.files.filter(f => f.filename.startsWith(folder + '/') && !f.filename.endsWith('.gitkeep')).length;
  showConfirmDialog(t('editor.folderDeleteTitle'),
    t('editor.folderDeleteBody')
      .replace('{name}', escHtml(folder.split('/').pop()))
      .replace('{extra}', count ? t('editor.folderDeleteExtra').replace('{n}', count) : t('editor.folderDeleteEmpty')),
    () => {
      card.files = card.files.filter(f => !f.filename.startsWith(folder + '/'));
      saveCodeCards();
      const el = document.getElementById(cardId);
      if (el) { el.remove(); renderResultCard(card.files, cardId); }
      showToast(t('editor.folderDeleted'));
    }
  );
}
