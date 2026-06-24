// ============================================================================
// core.js — état global, helpers, dialogs, sidebar, thème, i18n, init principal
// Extrait de qa-agent.js (découpage par domaine). Script classique, fonctions globales.
// ============================================================================

// ── State ──────────────────────────────────────────────────────────────────────


let azureSession  = null; // { org, project }
let jiraSession = null; // { host, projectKey, token, email }
let chatHistory  = [];   // { role, content }[]
let isThinking        = false;
let pendingTestCases  = null; // current block (legacy compat)
let pendingBlocks     = [];   // [{ blockId, title, pageLabel, cases[] }] — multi-block POM

// _rerenderCardIfRendered — globale : appelée par connectSyncSSE (ci-dessous) ET par connectLive (live.js)
function _rerenderCardIfRendered(card) {
  try {
    if (!card || !card.cardId) return;
    if (window._rfRunning || window._suiteRunning) return;
    const el = document.getElementById(card.cardId);
    if (el && typeof renderResultCard === 'function') {
      // memoriser la position d origine (le noeud qui suit)
      const parent = el.parentNode;
      const nextSibling = el.nextSibling;
      el.remove();
      renderResultCard(card.files, card.cardId);
      // renderResultCard a fait appendChild (en dernier) -> on replace a l origine
      const fresh = document.getElementById(card.cardId);
      if (fresh && parent && nextSibling && nextSibling.parentNode === parent) {
        parent.insertBefore(fresh, nextSibling);
      }
    }
  } catch(e) {}
}
// ── Syntax highlight ───────────────────────────────────────────────────────────
function syntaxHL(code) {
  if (!code) return '';
  // Ne pas appliquer si le code contient deja des spans HTML
  if (code.includes('<span')) return code;
  var c = code;
  // Sections *** ... ***
  c = c.replace(/(\*{3}[^*\n]+\*{3})/g, '<span style="color:#e06c75;font-weight:700">$1</span>');
  // Variables ${...}
  c = c.replace(/(\$\{[^}]+\})/g, '<span style="color:#e5c07b">$1</span>');
  // Keywords speciaux [Arguments] etc
  c = c.replace(/(\[(?:Arguments|Return|Documentation|Tags|Setup|Teardown|Timeout)\])/g, '<span style="color:#c678dd">$1</span>');
  // Commentaires # (seulement en debut de mot, pas dans les URLs/couleurs)
  c = c.replace(/(^|\n)([ \t]*#[^\n]*)/g, '$1<span style="color:#5c6370;font-style:italic">$2</span>');
  return c;
}


// ── Markdown renderer (minimal) ────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--muted);padding:1px 5px;border-radius:3px;font-family:\'IBM Plex Mono\',monospace;font-size:12px">$1</code>')
    .replace(/^> (.+)$/gm, '<div style="border-left:3px solid var(--teal);padding-left:10px;color:#8ab4c4;font-style:italic;margin:6px 0">$1</div>')
    .replace(/\n/g, '<br>');
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function escHtml(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function stripHtml(h) {
  return (h||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}

function cleanRobotCodeFromHtml(code) {
  if (!code) return code;
  // Supprimer les balises span de coloration syntaxique
  var c = code.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  // Decoder les entites HTML
  c = c.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  return c;
}

function scrollToBottom() {
  const el = document.getElementById('messages');
  setTimeout(() => el.scrollTop = el.scrollHeight, 50);
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function insertCmd(text) {
  const input = document.getElementById('userInput');
  input.value = text;
  input.focus();
  autoResize(input);
  // Place cursor at end
  input.setSelectionRange(text.length, text.length);
}

function copyText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ copié';
    setTimeout(() => btn.textContent = 'copier', 2000);
    showToast('✓ Code copié !');
  });
}

function clearChat() {
  showConfirmDialog('🗑 Reset complet', 'Supprimer la conversation, tous les rapports et blocs de code ?', async () => {
    chatHistory = [];
    azureSession = null;
    try {
      ['qa_agent_history','qa_agent_azure','qa_agent_jira','qa_agent_pending','qa_code_cards','qa_stats','qa_tc_store','qa_tc_store'].forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('qa_tc_store');
      pendingTestCases = null;
      _rfPaused = false;
      Object.values(scheduleTimers).forEach(t => clearTimeout(t));
      scheduleTimers = {};
      jiraSession = null;
      window._codeCards = [];
      _reportHistory = [];
      Object.keys(TC_STORE).forEach(k => delete TC_STORE[k]);
    } catch(e) {}
    // Vide les collections MongoDB
    try {
      await fetch('http://localhost:3001/api/storage/clear', { method: 'DELETE' });
    } catch(e) { console.warn('MongoDB clear error:', e.message); }
    document.getElementById('messages').innerHTML = '';
    showWelcome();
    updateStatsBar();
    showToast('🗑 Reset complet — conversation et données effacées');
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
// ── Custom dialog helpers ────────────────────────────────────────────────────
function showInputDialog(title, label, defaultVal, callback) {
  document.getElementById('_customDialog')?.remove();
  const d = document.createElement('div');
  d.id = '_customDialog';
  d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  d.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:400px;overflow:hidden">
      <div style="padding:14px 18px;background:var(--card);border-bottom:1px solid var(--border);font-size:14px;font-weight:700;color:var(--text)">${title}</div>
      <div style="padding:18px">
        <div style="font-size:12px;color:var(--gray);font-family:'IBM Plex Mono',monospace;margin-bottom:8px">${label}</div>
        <input id="_dialogInput" value="${escHtml(defaultVal)}"
          style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:7px;
                 color:var(--text);font-family:'IBM Plex Mono',monospace;font-size:13px;
                 padding:8px 12px;outline:none;box-sizing:border-box"
          onkeydown="if(event.key==='Enter'){document.getElementById('_dialogOk').click()}" />
      </div>
      <div style="display:flex;gap:10px;padding:14px 18px;border-top:1px solid var(--border);background:var(--card)">
        <button id="_dialogOk"
          style="flex:1;background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;
                 padding:9px;border-radius:7px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          ✅ Valider
        </button>
        <button onclick="document.getElementById('_customDialog').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);
                 padding:9px 16px;border-radius:7px;font-size:13px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          Annuler
        </button>
      </div>
    </div>`;
  document.body.appendChild(d);
  const input = document.getElementById('_dialogInput');
  input.focus(); input.select();
  document.getElementById('_dialogOk').onclick = () => {
    const val = input.value;
    d.remove();
    callback(val);
  };
}
function showConfirmDialog(title, message, callback) {
  document.getElementById('_customDialog')?.remove();
  const d = document.createElement('div');
  d.id = '_customDialog';
  d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  d.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:380px;overflow:hidden">
      <div style="padding:14px 18px;background:var(--card);border-bottom:1px solid var(--border);font-size:14px;font-weight:700;color:var(--text)">${title}</div>
      <div style="padding:18px;font-size:13px;color:var(--gray)">${message}</div>
      <div style="display:flex;gap:10px;padding:14px 18px;border-top:1px solid var(--border);background:var(--card)">
        <button id="_dialogConfirmOk"
          style="flex:1;background:rgba(220,38,38,0.15);border:1px solid var(--red);color:var(--red);
                 padding:9px;border-radius:7px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          🗑 Supprimer
        </button>
        <button onclick="document.getElementById('_customDialog').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);
                 padding:9px 16px;border-radius:7px;font-size:13px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          Annuler
        </button>
      </div>
    </div>`;
  document.body.appendChild(d);
  document.getElementById('_dialogConfirmOk').onclick = () => { d.remove(); callback(); };
}
// ── Theme toggle ──────────────────────────────────────────────────────────────
function toggleTheme() {
  const isLight = document.body.classList.toggle('theme-light');
  const btn = document.getElementById('themeBtn');
  btn.textContent = isLight ? '☀️' : '🌙';
  btn.title = isLight ? 'Passer en thème sombre' : 'Passer en thème clair';
  try { localStorage.setItem('qa_agent_theme', isLight ? 'light' : 'dark'); } catch(e) {}
}

// Restore theme on load
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('qa_agent_theme');
  if (saved === 'light') {
    document.body.classList.add('theme-light');
    const btn = document.getElementById('themeBtn');
    if (btn) { btn.textContent = '☀️'; btn.title = 'Passer en thème sombre'; }
  }
});
const TRANSLATIONS = {
  fr: {
    flag: '🇫🇷', name: 'FR',
    // Topbar
    poweredBy:        'propulsé par Claude',
    clearChat:        '✕ reset',
    // Sidebar sections
    generation:       '⚡ GÉNÉRATION',
    connections:      '🔗 CONNEXIONS',
    options:          '⚙️ OPTIONS',
    motto:            "💡 L'IA ne remplace pas le QA — elle supprime la partie rébarbative pour que tu te concentres sur ce qui compte.",
    // Sidebar buttons
    genTestCases:     '📋 Générer des cas de tests',
    genTestCasesDesc: 'Description libre → liste éditable',
    genRFCode:        '⚡ Générer le code RF',
    genRFCodeDesc:    'Cas de tests → fichier .robot',
    styleBDD:         '📝 Style BDD',
    styleBDDDesc:     'Given / When / Then',
    // Connections
    azureTitle:       'Azure DevOps',
    jiraTitle:        'Jira',
    notConnected:     'non connecté',
    urlLabel:         'URL du projet',
    tokenLabel:       'Token (PAT)',
    usNumberLabel:    'Numéro d\'US',
    jiraUrlLabel:     'URL Jira',
    emailLabel:       'Email',
    apiTokenLabel:    'Token API',
    taskNumberLabel:  'Numéro de tâche',
    fetchBtn:         'Récupérer',
    connectBtn:       '🔗 Connecter',
    // Options
    libLabel:         'LIB',
    styleLabel:       'STYLE',
    modeLabel:        'MODE',
    browserLabel:     'BROWSER',
    withBrowser:      '🖥️ Non Headless',
    withoutBrowser:   '🔇 Headless',
    // Input
    inputHint:        '↵ Envoyer · ⇧↵ Nouvelle ligne',
    submitBtn:        'SUBMIT',
    // Welcome
    welcomeTitle:     '👋 Bonjour ! Je suis ton **QA Agent** spécialisé Robot Framework.',
    // Report
    runTests:         '▶️ Lancer les tests',
    editReport:       '✏️ Éditer',
    history:          '📜 Historique',
    download:         '⬇️ Télécharger',
    // Report (report.js)
    'report.titleDefault':  'Rapport de Tests Automatisés',
    'report.suitePrefix':   'Suite : ',
    'report.suiteBadge':    '🧪 SUITE :',
    'report.moreOthers':    'autres',
    'report.passedShort':   'réussis',
    'report.failureWord':   'échec',
    'report.history':       '📜 Historique',
    'report.download':      '⬇️ Télécharger',
    'report.deleteTitle':   'Supprimer ce rapport',
    'report.generatedOn':   'Généré le',
    'report.environment':   'Environnement',
    'report.allPass':       '✅ TOUT PASSÉ',
    'report.failedWord':    'ÉCHOUÉS',
    'report.print':         '🖨️ Imprimer',
    'report.logRf':         '📋 Log Robot Framework',
    'report.logBloc':       '📋 Log bloc',
    'report.expandAll':     '▼ Tout déplier',
    'report.collapseAll':   '▲ Tout replier',
    'report.statTotal':     'TOTAL',
    'report.statPassed':    'RÉUSSIS',
    'report.statFailed':    'ÉCHOUÉS',
    'report.statSkipped':   'IGNORÉS',
    'report.statRate':      'TAUX',
    'report.statDuration':  'DURÉE TOTALE',
    'report.commentLabel':  '💬 COMMENTAIRE TEST MANAGER',
    'report.detailTitle':   '📋 DÉTAIL DES CAS DE TESTS',
    'report.failureAnalysis':'🔎 ANALYSE DE L\'ÉCHEC',
    'report.suggestedFix':  '💡 SOLUTION SUGGÉRÉE',
    'report.screenshotLabel':'📸 CAPTURE D\'ÉCRAN',
    'report.execSteps':     'ÉTAPES D\'EXÉCUTION',
    'report.colDuration':   'DURÉE',
    'report.statusPass':    'RÉUSSI',
    'report.statusFail':    'ÉCHOUÉ',
    'report.statusSkip':    'IGNORÉ',
    'report.footerStack':   'Robot Framework + SeleniumLibrary',
  },
  en: {
    flag: '🇬🇧', name: 'EN',
    poweredBy:        'powered by Claude',
    clearChat:        '✕ reset',
    generation:       '⚡ GENERATION',
    connections:      '🔗 CONNECTIONS',
    options:          '⚙️ OPTIONS',
    motto:            '💡 AI doesn\'t replace QA — it removes the tedious parts so you can focus on what matters.',
    genTestCases:     '📋 Generate test cases',
    genTestCasesDesc: 'Free description → editable list',
    genRFCode:        '⚡ Generate RF code',
    genRFCodeDesc:    'Test cases → .robot file',
    styleBDD:         '📝 BDD Style',
    styleBDDDesc:     'Given / When / Then',
    azureTitle:       'Azure DevOps',
    jiraTitle:        'Jira',
    notConnected:     'not connected',
    urlLabel:         'Project URL',
    tokenLabel:       'Token (PAT)',
    usNumberLabel:    'US Number',
    jiraUrlLabel:     'Jira URL',
    emailLabel:       'Email',
    apiTokenLabel:    'API Token',
    taskNumberLabel:  'Task number',
    fetchBtn:         'Fetch',
    connectBtn:       '🔗 Connect',
    libLabel:         'LIB',
    styleLabel:       'STYLE',
    modeLabel:        'MODE',
    browserLabel:     'BROWSER',
    withBrowser:      '🖥️ With browser',
    withoutBrowser:   '🔇 Without browser',
    inputHint:        '↵ Send · ⇧↵ New line',
    submitBtn:        'SUBMIT',
    welcomeTitle:     '👋 Hello! I\'m your **QA Agent** specialized in Robot Framework.',
    runTests:         '▶️ Run tests',
    editReport:       '✏️ Edit',
    history:          '📜 History',
    download:         '⬇️ Download',
    // Report (report.js)
    'report.titleDefault':  'Automated Test Report',
    'report.suitePrefix':   'Suite: ',
    'report.suiteBadge':    '🧪 SUITE:',
    'report.moreOthers':    'others',
    'report.passedShort':   'passed',
    'report.failureWord':   'failure',
    'report.history':       '📜 History',
    'report.download':      '⬇️ Download',
    'report.deleteTitle':   'Delete this report',
    'report.generatedOn':   'Generated on',
    'report.environment':   'Environment',
    'report.allPass':       '✅ ALL PASS',
    'report.failedWord':    'FAILED',
    'report.print':         '🖨️ Print',
    'report.logRf':         '📋 Robot Framework Log',
    'report.logBloc':       '📋 Block log',
    'report.expandAll':     '▼ Expand all',
    'report.collapseAll':   '▲ Collapse all',
    'report.statTotal':     'TOTAL',
    'report.statPassed':    'PASSED',
    'report.statFailed':    'FAILED',
    'report.statSkipped':   'SKIPPED',
    'report.statRate':      'RATE',
    'report.statDuration':  'TOTAL DURATION',
    'report.commentLabel':  '💬 TEST MANAGER COMMENT',
    'report.detailTitle':   '📋 TEST CASES DETAIL',
    'report.failureAnalysis':'🔎 FAILURE ANALYSIS',
    'report.suggestedFix':  '💡 SUGGESTED FIX',
    'report.screenshotLabel':'📸 SCREENSHOT',
    'report.execSteps':     'EXECUTION STEPS',
    'report.colDuration':   'DURATION',
    'report.statusPass':    'PASSED',
    'report.statusFail':    'FAILED',
    'report.statusSkip':    'SKIPPED',
    'report.footerStack':   'Robot Framework + SeleniumLibrary',
  },
};

let currentLang = 'fr';

// Registre de hooks de re-render pour les modules qui rendent hors [data-i18n]
// (rapports, etc.) : setLang() appelle chaque hook apres avoir retraduit le DOM.
window.__i18nRerender = window.__i18nRerender || [];

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['fr'][key] || key;
}

// Applique les traductions sur un sous-arbre (document par défaut).
// Conventions : data-i18n -> textContent ; data-i18n-ph -> placeholder ; data-i18n-title -> title.
// Réutilisable par les hooks __i18nRerender pour retraduire le chrome d'une carte sans rebuild.
function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n],[data-i18n-ph],[data-i18n-title]').forEach(el => {
    const k  = el.getAttribute('data-i18n');        if (k  !== null) el.textContent = t(k);
    const p  = el.getAttribute('data-i18n-ph');     if (p  !== null) el.placeholder = t(p);
    const ti = el.getAttribute('data-i18n-title');  if (ti !== null) el.title       = t(ti);
  });
}
window.applyI18n = applyI18n;

function setLang(lang) {
  // Deux langues seulement : tout le reste retombe sur fr (ex. ancien 'es'/'pt' en localStorage)
  if (lang !== 'fr' && lang !== 'en') lang = 'fr';
  currentLang = lang;
  const tr = TRANSLATIONS[lang];
  try { localStorage.setItem('qa_agent_lang', lang); } catch(e) {}

  // Update flag + name in button
  document.getElementById('langFlag').textContent = tr.flag;
  document.getElementById('langName').textContent  = tr.name;
  document.documentElement.lang = lang;

  // Update all data-i18n elements
  applyI18n(document);

  // Re-render des modules hors [data-i18n] (rapports, etc.)
  window.__i18nRerender.forEach(fn => { try { fn(currentLang); } catch(e) {} });

  // Update document title hint
  showToast(tr.flag + ' ' + (lang === 'en' ? 'English' : 'Français'));
}

// Sélecteur = simple bascule FR <-> EN (plus de menu déroulant)
function toggleLang() {
  setLang(currentLang === 'en' ? 'fr' : 'en');
}

// Restore language on load
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('qa_agent_lang') || 'fr';
  setLang(saved);
  const savedModel = localStorage.getItem('qa_agent_model');
  if (savedModel) { const m = document.getElementById('modelSelect'); if (m) m.value = savedModel; }
  const libEl = document.getElementById('optLibrary');
  if (libEl) {
    libEl.addEventListener('change', onLibraryChange);
    onLibraryChange();
  }

  // Restore last generated code for Replay
  try {
    const lastCode = localStorage.getItem('qa_last_code');
    const lastFile = localStorage.getItem('qa_last_file');
    const lastType = localStorage.getItem('qa_last_runtype');
    if (lastCode) {
      window._lastGeneratedCode = lastCode;
      window._lastGeneratedFile = lastFile || 'test_generated';
      window._lastRunType = lastType || 'web';
    } else {
      // Fallback: use last code card
      const cards = JSON.parse(localStorage.getItem('qa_code_cards') || '[]');
      const lastCard = [...cards].reverse().find(c => c.type !== 'report' && c.files?.length);
      if (lastCard) {
        window._lastGeneratedCode = lastCard.files.map(f => f.code).join('\n');
        window._lastGeneratedFile = lastCard.files[0]?.filename?.replace('.robot','') || 'test_generated';
      }
    }
  } catch(e) {}

  // Restore "Test en cours" on page refresh
  try {
    const activeRun = localStorage.getItem('qa_active_run');
    if (activeRun) {
      // Don't restore suite runs — they would cause double execution
      try {
        const ar = JSON.parse(activeRun);
        if (ar.label && ar.label.includes('Suite')) {
          localStorage.removeItem('qa_active_run');
          return;
        }
      } catch(e) {}
      const { runMsgId, label } = JSON.parse(activeRun);
      const div = document.createElement('div');
      div.className = 'msg agent';
      div.id = runMsgId;
      div.innerHTML =
        '<div class="msg-avatar">🤖</div>' +
        '<div class="msg-body"><div class="msg-bubble" style="padding:10px 14px">' +
        '<span id="' + runMsgId + '-label" style="font-size:13px;font-weight:600;color:var(--warn)">⏳ Test en cours — ' + label + ' (page rafraîchie)</span>' +
        '</div></div>';
      document.getElementById('messages')?.appendChild(div);
      window._currentRunMsgId = runMsgId;

      // Poll server every 3s to check if run completed
      const pollInterval = setInterval(async () => {
        try {
          const resp = await fetch('http://localhost:3001/api/rf/status');
          if (!resp.ok) return;
          const data = await resp.json();
          if (data.status === 'idle' && data.results) {
            clearInterval(pollInterval);
            localStorage.removeItem('qa_active_run');
            // Show report without re-running
            const lbl = document.getElementById(runMsgId + '-label');
            if (lbl) {
              const icon = data.results.status === 'PASS' ? '✅' : '❌';
              const rate = data.results.total > 0 ? Math.round(data.results.passed / data.results.total * 100) : 0;
              lbl.textContent = icon + ' ' + data.results.status + ' — ' + data.results.passed + '/' + data.results.total + ' (' + rate + '%) en ' + fmtDuration(data.results.duration);
              lbl.style.color = data.results.status === 'PASS' ? 'var(--teal)' : 'var(--red)';
            }
            openTestReport(data.results);
          } else if (data.status === 'idle') {
            clearInterval(pollInterval);
            const lbl = document.getElementById(runMsgId + '-label');
            if (lbl) { lbl.textContent = '⚠️ Run terminé — rafraîchis pour voir le rapport'; lbl.style.color = 'var(--warn)'; }
            localStorage.removeItem('qa_active_run');
          }
        } catch(e) { clearInterval(pollInterval); }
      }, 3000);
    }
  } catch(e) {}
});

// ── Init everything after DOM is ready ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Keyboard: Enter to send, Shift+Enter for newline
  const input = document.getElementById('userInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // API key status + save
  const apiKeyEl = document.getElementById('apiKey');
  if (apiKeyEl) {
    apiKeyEl.addEventListener('input', e => {
      updateKeyStatus(e.target.value);
      LS.save();
    });
  }

  // Selects save on change
  ['optLibrary', 'optStyle', 'optMode'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => LS.save());
  });

  // Charger la clé API depuis le serveur (chiffrée dans .env)
  (async () => {
    try {
      const tokenR = await fetch('http://localhost:3001/api/config/token');
      const tokenD = await tokenR.json();
      const provider = localStorage.getItem('qa_provider') || 'anthropic';
      const keyR = await fetch(`http://localhost:3001/api/config/apikey?token=${tokenD.token}&provider=${provider}`);
      if (keyR.ok) {
        const keyD = await keyR.json();
        if (keyD.key) {
          window._serverApiKey = keyD.key;
          document.getElementById('apiKey').value = '';
          document.getElementById('apiKey').placeholder = '🔒 Clé API configurée dans .env';
          document.getElementById('apiKey').disabled = true;
          updateKeyStatus(keyD.key);
        }
      }
    } catch(e) {
      // Pas de serveur ou pas de clé — utiliser la clé saisie manuellement
    }
  })();

  // Connexion SSE permanente pour sync VS Code → UI
  (function connectSyncSSE() {
    const es = new EventSource('http://localhost:3001/api/rf/live-stream');
    es.addEventListener('file-changed', e => {
      const { filepath, content } = JSON.parse(e.data);
      let updated = false;
      let _changedCard = null;
      // FIX contamination : ne synchroniser QUE la carte en cours d'execution.
      // Avant on bouclait sur TOUTES les cartes en matchant par nom de fichier
      // (variables.robot, keywords.robot...) communs -> le run d'un bloc ecrasait
      // le code des autres cartes. On cible desormais la seule carte _lastCardId.
      const _tgtCard = (window._codeCards||[]).find(c => c.cardId === window._lastCardId);
      if (_tgtCard && _tgtCard.files) {
        const fname = filepath.split('/').pop();
        const f = _tgtCard.files.find(f => f.filename === filepath || (f.filename||'').split('/').pop() === fname);
        if (f && f.code !== content) {
          f.code = content;
          updated = true;
          _changedCard = _tgtCard;
        }
      }
      if (updated) {
        saveCodeCards();
        _rerenderCardIfRendered(_changedCard);
        // Pas de re-render complet — juste un toast discret
        // Le code est mis à jour en mémoire, sera utilisé au prochain run
        showToast('🔄 ' + filepath.split('/').pop() + ' synchronisé');
      }
    });
    es.onerror = () => setTimeout(connectSyncSSE, 3000);
  })();

  // Load all saved data
  LS.load().catch(e => console.warn('LS.load error:', e));

  // Restore stats immediately
  restoreStatsBar();

  // Restore provider & model
  try {
    const savedProv = localStorage.getItem('qa_provider') || 'anthropic';
    const provEl = document.getElementById('providerSelect');
    if (provEl) { provEl.value = savedProv; onProviderChange(savedProv); }
    const savedMod = localStorage.getItem('qa_agent_model');
    if (savedMod) { const ms = document.getElementById('modelSelect'); if (ms) ms.value = savedMod; }
  } catch(e) {}
});

// ── Sidebar toggle (mobile) ───────────────────────────────────────────────────
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// Close sidebar when a cmd-btn is clicked on mobile
document.addEventListener('click', e => {
  if (e.target.closest('.cmd-btn') && window.innerWidth <= 640) {
    closeSidebar();
  }
});
