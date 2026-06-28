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
        if (el) { renderResultCard(card.files, cardId); }
      });
      continue;
    }

    await readAndAddFile(file, name, ext, card, false);
    count++;
  }

  if (count > 0) {
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { renderResultCard(card.files, cardId); }
    showToast(t('editor.imported').replace('{n}', count));
  }

  // Reset input
  event.target.value = '';
}

async function readAndAddFile(file, name, ext, card, replace) {
  const isImage  = ['png','jpg','jpeg'].includes(ext);          // aperçu image
  // Fichiers d'UPLOAD (data) -> base64 (round-trip binaire intact). PAS .robot/.resource/.py (= code, restent texte éditable).
  const isBinary = isImage || ['pdf','txt','csv','xls','xlsx'].includes(ext);
  // Limite de taille (uniquement pour les binaires, lourds en base64)
  if (isBinary && file.size > 3 * 1024 * 1024) {
    showToast(t('editor.fileTooLarge').replace('{name}', name));
    return;
  }
  const content = await new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    if (isBinary) r.readAsDataURL(file);  // base64 data URL (décodé côté serveur à l'écriture disque)
    else          r.readAsText(file);
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
    } else if (isBinary) {
      filename = 'resources/files/' + name;   // dossier dédié aux fichiers d'upload (≠ screenshots de run)
    }
  }

  if (replace) {
    const existing = card.files.find(f => f.filename.endsWith('/' + name) || f.filename === name);
    if (existing) {
      existing.code = content; existing.isImage = isImage; existing.binary = isBinary;
      // Migrer un upload vers resources/files/ (ex. ancien rangement files/ ou screenshots/)
      if (isBinary && !existing.filename.startsWith('resources/files/')) existing.filename = 'resources/files/' + name;
      return;
    }
  }

  card.files.push({ filename, code: content, isImage: isImage || false, binary: isBinary || false });
}


// dropCardToSuite retiré : le drag carte-vers-suite est supprimé (redondant avec la modale _suitePickerModal).

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
    if (el) { renderResultCard(card.files, cardId); }
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
    if (el) { renderResultCard(card.files, cardId); }
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
    if (el) { renderResultCard(card.files, cardId); }
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
    if (el) { renderResultCard(card.files, cardId); }
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
  if (el) { renderResultCard(card.files, cardId); }
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
    if (el) { renderResultCard(card.files, cardId); }
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
      if (el) { renderResultCard(card.files, cardId); }
      showToast(t('editor.folderDeleted'));
    }
  );
}
