// ── State ──────────────────────────────────────────────────────────────────────


let azureSession  = null; // { org, project }
let jiraSession = null; // { host, projectKey, token, email }
let chatHistory  = [];   // { role, content }[]
let isThinking        = false;
let pendingTestCases  = null; // current block (legacy compat)
let pendingBlocks     = [];   // [{ blockId, title, pageLabel, cases[] }] — multi-block POM

// ── Persist ────────────────────────────────────────────────────────────────────
const LS = {
  save() {
    try {
      localStorage.setItem('qa_agent_key',      document.getElementById('apiKey').value);
      localStorage.setItem('qa_agent_history', JSON.stringify(chatHistory));
      // Save TC_STORE — only cards still in DOM
      const tcStoreLight = {};
      Object.keys(TC_STORE).forEach(id => {
        if (!document.getElementById(id)) return; // skip removed cards
        const s = TC_STORE[id];
        tcStoreLight[id] = { cases: s.cases, url: s.url, pages: s.pages, pageLabel: s.pageLabel };
      });
      localStorage.setItem('qa_tc_store', JSON.stringify(tcStoreLight));
      // Save generated code cards
      localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards || []));
      localStorage.setItem('qa_agent_azure',    JSON.stringify(azureSession));
      localStorage.setItem('qa_agent_jira',     JSON.stringify(jiraSession));
      localStorage.setItem('qa_agent_pending',  pendingTestCases ? JSON.stringify(pendingTestCases) : '');
      localStorage.setItem('qa_agent_lib',      document.getElementById('optLibrary').value);
      localStorage.setItem('qa_agent_style',    document.getElementById('optStyle').value);
      localStorage.setItem('qa_agent_mode',     'multi');
      const hl = document.getElementById('optHeadless'); if (hl) localStorage.setItem('qa_agent_headless', hl.value);
      localStorage.setItem('qa_agent_welcomed', '1');
    } catch(e) { console.warn('localStorage unavailable — run via http://localhost', e); }
  },
  load() {
    // Always show welcome message first
    showWelcome();

    try {
      // ── API key
      const key = localStorage.getItem('qa_agent_key');
      if (key) { document.getElementById('apiKey').value = key; updateKeyStatus(key); }

      // ── Selects
      const lib   = localStorage.getItem('qa_agent_lib');
      const style = localStorage.getItem('qa_agent_style');
      const mode  = localStorage.getItem('qa_agent_mode');
      if (lib)   document.getElementById('optLibrary').value = lib;
      if (style) document.getElementById('optStyle').value   = style;
      // multi mode is always default
    const headlessSaved = localStorage.getItem('qa_agent_headless'); if (headlessSaved) { const hel = document.getElementById('optHeadless'); if (hel) hel.value = headlessSaved; }

      // ── Sessions
      const az = localStorage.getItem('qa_agent_azure');
      if (az)  { try { azureSession  = JSON.parse(az); } catch(e) {} }
      const jl = localStorage.getItem('qa_agent_jira');
      if (jl)  { try { jiraSession   = JSON.parse(jl); } catch(e) {} }
      const pt = localStorage.getItem('qa_agent_pending');
      if (pt)  { try { pendingTestCases = JSON.parse(pt); } catch(e) {} }

      // ── Chat history
      const hist = localStorage.getItem('qa_agent_history');
      if (hist) {
        const parsed = JSON.parse(hist);
        if (parsed.length > 0) {
          chatHistory = parsed;
          chatHistory.forEach(m => {
            if (m.role === 'user') renderUserMsg(m.content, false);
            else                   renderAgentMsg(m.content, false);
          });
          // Re-render TC cards — clear store first to avoid duplicates
          const tcStored = localStorage.getItem('qa_tc_store');
          Object.keys(TC_STORE).forEach(k => delete TC_STORE[k]);
          if (tcStored) {
            try {
              const stored = JSON.parse(tcStored);
              Object.keys(stored).forEach(cardId => {
                const s = stored[cardId];
                TC_STORE[cardId] = s;
                // Restore pages directly — don't re-derive from cases
                if (!TC_STORE[cardId].pages && s.pages) TC_STORE[cardId].pages = s.pages;
                const cases = s.pages ? s.pages.flatMap(p => p.cases||[]) : (s.cases||[]);
                if (cases.length > 0) renderTestCasesCard(cases, s.url, false, cardId);
              });
            } catch(e) {}
          } else if (pendingTestCases?.cases?.length) {
            renderTestCasesCard(pendingTestCases.cases, pendingTestCases.url, false);
          }

          // Re-render code cards
          const codeStored = localStorage.getItem('qa_code_cards');
          if (codeStored) {
            try {
              const cards = JSON.parse(codeStored);
              window._codeCards = cards;
              cards.forEach(card => {
                if (card.type === 'suite-report') {
                  setTimeout(() => renderConsolidatedSuiteReport(card), 0);
                } else if (card.type === 'report') {
                  // Évite le doublon : pas de re-render si isSuite (déjà rendu via suite-report)
                  // et pas de re-render si déjà dans le DOM
                  if (!card.data?.isSuite && !document.getElementById('reportCard-' + card.data?.runNumber)) {
                    setTimeout(() => renderReportCard(card.data), 0);
                  }
                } else if (card.type === 'multi' || card.files?.[0]) {
                  const files = (card.files||[]).map(f => ({
                    ...f,
                    code: f.code && f.code.includes('%20') ? (() => { try { return decodeURIComponent(f.code); } catch(e) { return f.code; } })() : f.code
                  }));
                  window._lastGeneratedTitle = card.title || '';
                  renderResultCard(files, card.cardId);
                }
              });
            } catch(e) {}
          }
          scrollToBottom();
        }
      }

      // ── Warn if running from file://
      if (window.location.protocol === 'file:') {
        setTimeout(() => {
          renderAgentMsg('⚠️ **localStorage désactivé** en mode `file://`\n\nLes données ne sont pas persistées. Lance un serveur local :\n\n`node server.js` puis ouvre `http://localhost:3001/qa-agent.html`', false);
        }, 500);
      }

    } catch(e) { console.warn('LS.load error:', e); }
  },
};

// ── API key (attached in DOMContentLoaded below) ──────────────────────────────

function updateKeyStatus(val) {
  const el = document.getElementById('keyStatus');
  const provider = getCurrentProvider();
  const minLen = { anthropic: 20, openai: 20, gemini: 10, mistral: 10 };
  const ok = val && val.length >= (minLen[provider] || 10);
  el.textContent = ok ? '⬤ ready' : '⬤ no key';
  el.className   = 'key-status' + (ok ? ' ok' : '');
}

// ── Welcome message ────────────────────────────────────────────────────────────
function showWelcome() {
  renderAgentMsg(`👋 Bonjour ! Je suis ton **QA Agent** spécialisé Robot Framework.

**Ce que je peux faire :**
- 🔵 Me connecter à **Azure DevOps** → récupérer une US → générer les tests RF
- 🟦 Me connecter à **Jira** → récupérer une US → générer les tests RF
- 🌐 Me connecter à **n'importe quelle app web** → générer des tests depuis l'URL
- 🤖 Générer des tests en **Keyword-Driven**, **BDD (Given/When/Then)** ou **Data-Driven**
- 📁 Créer une architecture **multi-fichiers** (variables.robot, keywords.robot, tests.robot)

**Comment ça marche en 2 étapes :**
1️⃣ Tu décris ce que tu veux tester → je propose des **cas de tests** en langage naturel (modifiables)
2️⃣ Tu valides → tu copies les cas → tu tapes **"génère le code RF"** → j'écris le fichier .robot

**Exemples de commandes :**
> *"Connecte-toi sur https://the-internet.herokuapp.com/login avec username: tomsmith et password: SuperSecretPassword! et génère 3 cas de tests"*

> *"Connecte-toi sur Azure https://dev.azure.com/monorg/projet avec le token XYZ, cherche l'US #42 et génère les tests RF en BDD"*

> *"Connecte-toi sur Jira https://monorg.atlassian.net avec email@company.com et token XYZ, cherche l'US PROJ-42"*

> *"Génère le code RF"* ← après avoir validé les cas de tests

**Configuration :** Colle ta clé API Anthropic en haut à droite, choisis la librairie et le style dans la sidebar. 🚀

💡 *L'IA ne remplace pas le QA — elle supprime la partie rébarbative pour que tu te concentres sur ce qui compte.*`, false);
}

// ── Render messages ────────────────────────────────────────────────────────────
function renderUserMsg(text, save = true) {
  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div class="msg-body">
      <div class="msg-bubble">${escHtml(text)}</div>
    </div>`;
  document.getElementById('messages').appendChild(div);
  if (save) { chatHistory.push({ role: 'user', content: text }); LS.save(); }
  scrollToBottom();
}

function renderAgentMsg(markdown, save = true) {
  const div = document.createElement('div');
  div.className = 'msg agent';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-body">
      <div class="msg-bubble">${renderMarkdown(markdown)}</div>
    </div>`;
  document.getElementById('messages').appendChild(div);
  if (save) { chatHistory.push({ role: 'assistant', content: markdown }); LS.save(); }
  scrollToBottom();
  return div;
}


// Azure DevOps work item type → icône + couleur
function azureTypeTag(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('bug'))                                   return `<span style="background:rgba(230,57,70,0.15);color:#DC2626;border:1px solid rgba(230,57,70,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">🐛 Bug</span>`;
  if (t.includes('epic'))                                  return `<span style="background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">⚡ Epic</span>`;
  if (t.includes('user story') || t.includes('story'))    return `<span style="background:rgba(0,212,170,0.15);color:var(--teal);border:1px solid rgba(0,212,170,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">📖 User Story</span>`;
  if (t.includes('task') || t.includes('tâche'))          return `<span style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">✅ Task</span>`;
  if (t.includes('feature'))                              return `<span style="background:rgba(245,158,11,0.15);color:var(--warn);border:1px solid rgba(245,158,11,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">🌟 Feature</span>`;
  if (t.includes('test case') || t.includes('test'))      return `<span style="background:rgba(0,212,170,0.1);color:var(--teal);border:1px solid rgba(0,212,170,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">🧪 Test</span>`;
  return `<span class="tag azure">${escHtml(type || '—')}</span>`;
}

function renderUsCard(us) {
  const html = `
    <div class="us-card">
      <div class="us-id">📋 Work Item #${us.id} · ${azureTypeTag(us.type)} · <span class="tag warn">${us.state}</span></div>
      <div class="us-title">${escHtml(us.title)}</div>
      ${us.description ? `<div class="us-section"><div class="us-section-label">DESCRIPTION</div><div class="us-section-content">${escHtml(stripHtml(us.description))}</div></div>` : ''}
      ${us.acceptance  ? `<div class="us-section"><div class="us-section-label">CRITÈRES D'ACCEPTANCE</div><div class="us-section-content us-acceptance">${escHtml(stripHtml(us.acceptance))}</div></div>` : ''}
      ${us.tags ? `<div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;margin-top:8px">Tags : ${escHtml(us.tags)}</div>` : ''}
    </div>`;
  return html;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg agent';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-body">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
  document.getElementById('messages').appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ── Send message ───────────────────────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text  = input.value.trim();
  if (!text || isThinking) return;

  const apiKey = document.getElementById('apiKey').value.trim();
  const provider = getCurrentProvider();
  const keyPrefixes = {
    anthropic: 'sk-ant-',
    openai: 'sk-',
    gemini: '', // Gemini keys don't have a fixed prefix
    mistral: '',
  };
  const prefix = keyPrefixes[provider] || '';
  if (!apiKey || (prefix && !apiKey.startsWith(prefix))) {
    showToast('⚠️ Configure ta clé API ' + provider + ' en haut à droite');
    return;
  }

  input.value = '';
  input.style.height = 'auto';
  window._lastApiKey = apiKey;
  renderUserMsg(text);
  await processMessage(text, apiKey);
}

async function processMessage(userText, apiKey) {
  isThinking = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  try {
    const lower = userText.toLowerCase();

    // ── Helpers ───────────────────────────────────────────────────────────────
    const urlMatch      = userText.match(/https?:\/\/[^\s]+/i);
    const tokenMatch    = userText.match(/(?:token|pat|clé|key)\s+([A-Za-z0-9+/=_\-]{20,})/i);
    const isJira        = /jira|atlassian/i.test(lower);
    const isAzure       = /azure|devops/i.test(lower);
    const isConnectCmd  = /connect|connecte/i.test(lower);
    const isGenCmd      = /génère|genere|generate|crée|cree|cas\s+de\s+test|tests?\s+rf|robot\s+framework|test(er|s)?\s+\d+|\d+\s+(cas|test)/i.test(lower);
    const usNumMatch    = userText.match(/(?:us|user.?story|work.?item|ticket|issue|#)\s*[#n°]?\s*(\d+)/i);
    const jiraKeyMatch = userText.match(/\b([A-Z][A-Z0-9]+-\d+)\b/);
    const nbTestsMatch  = userText.match(/(\d+)\s*cas\s*de\s*tests?/i);

    // ── 1. Azure connect ──────────────────────────────────────────────────────
    if (isConnectCmd && isAzure && urlMatch && tokenMatch) {
      hideTyping();
      await handleAzureConnect(urlMatch[0], tokenMatch[1], apiKey, userText);
      return;
    }

    // ── 2. Jira connect ───────────────────────────────────────────────────────
    if (isConnectCmd && isJira && urlMatch && tokenMatch) {
      hideTyping();
      await handleJiraConnect(urlMatch[0], tokenMatch[1], apiKey, userText);
      return;
    }

    // ── 3. Fetch Jira issue (PROJ-42 format) ──────────────────────────────────
    if (jiraKeyMatch && jiraSession) {
      hideTyping();
      await handleJiraFetch(jiraKeyMatch[1], isGenCmd, apiKey);
      return;
    }

    // ── 4. Fetch Azure US (numeric id) ────────────────────────────────────────
    if (usNumMatch && azureSession && !urlMatch) {
      hideTyping();
      await handleFetchAndGenerate(usNumMatch[1], isGenCmd, apiKey, userText);
      return;
    }

    // ── 5. "Génère le code RF" sur les cas en attente ───────────────────────────
    const isCodeCmd = /génère\s+le\s+code|genere\s+le\s+code|generate\s+(the\s+)?code|convertis|robot\s+framework|\.robot/i.test(lower);
    if (isCodeCmd && pendingTestCases) {
      hideTyping();
      await generateCodeFromCases(apiKey);
      return;
    }

    // ── 6. URL + app → générer d'abord les cas de tests ──────────────────────
    if ((urlMatch || isConnectCmd) && !isAzure && !isJira) {
      hideTyping();
      await handleUrlTestCases(userText, urlMatch ? urlMatch[0] : null, apiKey, nbTestsMatch ? parseInt(nbTestsMatch[1]) : null);
      return;
    }

    // ── 7. Description sans URL → générer d'abord les cas ────────────────────
    if (isGenCmd && !urlMatch && !isAzure && !isJira) {
      hideTyping();
      await handleUrlTestCases(userText, null, apiKey, nbTestsMatch ? parseInt(nbTestsMatch[1]) : null);
      return;
    }

    // ── 8. Default: conversational ────────────────────────────────────────────
    const response = await callClaude(apiKey, userText);
    hideTyping();
    if (response) renderAgentMsg(response);

  } catch(err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur : ${err.message}`);
  } finally {
    isThinking = false;
    document.getElementById('sendBtn').disabled = false;
  }
}

// ── STEP 1 : Générer les cas de tests en langage naturel ─────────────────────
async function handleUrlTestCases(userText, url, apiKey, nbTests) {
  const usernameMatch = userText.match(/(?:username|user|utilisateur|login|identifiant)\s*[:\s]+([^\s,]+)/i);
  const passwordMatch = userText.match(/(?:password|mot\s*de\s*passe|mdp|pwd)\s*[:\s]+([^\s,]+)/i);
  const username = usernameMatch ? usernameMatch[1].replace(/[!,;.]$/, '') : null;
  const password = passwordMatch ? passwordMatch[1].replace(/[!,;.]$/, '') : null;

  showTyping();

  const nb = nbTests || 3;
  const tcLangInstr = {
    fr: 'Génère les cas de tests en FRANÇAIS.',
    en: 'Generate the test cases in ENGLISH.',
    es: 'Genera los casos de prueba en ESPAÑOL.',
    pt: 'Gera os casos de teste em PORTUGUÊS.',
  }[currentLang] || 'Génère les cas de tests en FRANÇAIS.';

  const prompt = `Tu es un expert QA. ${tcLangInstr}
Génère exactement ${nb} cas de tests FONCTIONNELS en langage naturel (PAS de code Robot Framework).
Réponds UNIQUEMENT avec le JSON demandé.

Pour :

Contexte : ${userText}
${url      ? `URL : ${url}` : ''}
${username ? `Username : ${username}` : ''}
${password ? `Password : ${password}` : ''}

Format de réponse OBLIGATOIRE — réponds UNIQUEMENT avec cette structure JSON, rien d'autre :
{
  "cases": [
    { "id": 1, "testId": "TC_001", "name": "Nom du cas", "description": "Description courte", "expected": "Résultat attendu" },
    { "id": 2, "testId": "TC_002", "name": "...", "description": "...", "expected": "..." }
  ]
}`;

  try {
    const raw  = await callClaudeHaiku(apiKey, prompt);
    const clean = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
    const parsed = JSON.parse(clean);
    hideTyping();

    // Save state for step 2
    pendingTestCases = { userText, url, username, password, cases: parsed.cases };
    const blockId2 = 'block-' + Date.now();
    // Generate a meaningful page label from URL or user text
    let pageLabel2 = 'Page principale';
    if (url) {
      try {
        const p = new URL(url).pathname.replace(/\//g,' ').trim();
        pageLabel2 = p || new URL(url).hostname.split('.')[0];
      } catch(e) { pageLabel2 = url.split('/').pop() || 'Page'; }
    } else if (userText) {
      // Extract page name from text (first meaningful noun after "page", "formulaire", etc.)
      const m = userText.match(/(?:page|formulaire|module|section|écran|menu)\s+([\w-]+)/i);
      pageLabel2 = m ? m[1] : userText.slice(0, 30).replace(/génère|genere|cas|tests?|de|pour|les|des|du/gi,'').trim() || 'Page principale';
    }

    const block2 = {
      blockId:   blockId2,
      title:     userText.slice(0,50) || 'Cas de tests',
      pageLabel: pageLabel2,
      cases:     parsed.cases,
    };
    pendingBlocks.push(block2);
    LS.save();

    renderTestCasesCard(parsed.cases, url, true, blockId2);

  } catch(err) {
    hideTyping();
    // If it's an API error (quota, model not found, etc.) show it clearly
    const msg = err.raw || err.message || '';
    if (msg.includes('quota') || msg.includes('not found') || msg.includes('API') || msg.includes('error') || !msg.startsWith('{')) {
      renderAgentMsg(`❌ Erreur API : ${msg}`);
    } else {
      // Fallback: display raw text if JSON parse fails
      renderAgentMsg(`Voici les cas de tests proposés :\n\n${msg}\n\n💬 Dis **"génère le code RF"** quand tu es prêt.`);
    }
  }
}

// ── Render test cases card — editable + actions ───────────────────────────────
const TC_STORE = {}; // cardId → { cases, url }

function renderTestCasesCard(cases, url, save = true, blockId) {
  // Use blockId if provided (restoration) to keep same cardId
  const cardId = blockId || ('tc-' + Date.now());
  // If restoring and TC_STORE already has this cardId (from localStorage), keep existing data
  if (!TC_STORE[cardId]) {
    TC_STORE[cardId] = { cases: cases.map(c => ({...c})), url };
    setTimeout(updateStatsBar, 100);
  } else {
    // Restore: update url if needed but keep pages/cases from TC_STORE
    TC_STORE[cardId].url = url || TC_STORE[cardId].url;
  }

  const div = document.createElement('div');
  div.className = 'msg agent';
  div.id = cardId;
  document.getElementById('messages').appendChild(div);

  rebuildCard(cardId);

  if (save) {
    chatHistory.push({ role: 'assistant', content: '[Test cases: ' + cases.map(c => c.name).join(', ') + ']' });
    LS.save();
  }
  scrollToBottom();
}

function rebuildCard(cardId) {
  const store = TC_STORE[cardId];
  if (!store) return;
  const { cases, url } = store;
  // Ensure pages array exists
  if (!store.pages) store.pages = [{ label: url ? (() => { try { return new URL(url).hostname; } catch(e) { return 'Page principale'; } })() : 'Page principale', cases }];
  const el = document.getElementById(cardId);
  if (!el) return;

  const hostname = url ? (() => { try { return new URL(url).hostname; } catch(e) { return url; } })() : null;

  // Build cases HTML safely using template with escaped values
  let casesHtml = cases.map((c, idx) => {
    const safeId    = escHtml(String(c.id));
    const safeName  = escHtml(c.name || '');
    const safeDesc  = escHtml(c.description || '');
    const safeExp   = escHtml(c.expected || '');
    return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:12px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="background:rgba(0,212,170,0.15);color:var(--teal);font-family:'IBM Plex Mono',monospace;font-size:11px;padding:3px 10px;border-radius:4px;border:1px solid rgba(0,212,170,0.3);white-space:nowrap;font-weight:700">TC-${safeId}</span>
        <input data-card="${cardId}" data-idx="${idx}" data-field="name" value="${safeName}" placeholder="Nom du cas"
          style="flex:1;background:transparent;border:none;color:var(--text);font-weight:700;font-size:16px;font-family:'Syne',sans-serif;outline:none;min-width:0" />
        <button data-card="${cardId}" data-idx="${idx}" data-action="delete" title="Supprimer"
          style="background:rgba(230,57,70,0.12);border:1px solid rgba(230,57,70,0.3);color:#DC2626;width:30px;height:30px;border-radius:5px;font-size:14px;cursor:pointer;flex-shrink:0" title="Fermer">✕</button>
      </div>
      <div style="padding:12px 16px 8px">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:6px">DESCRIPTION</div>
        <textarea data-card="${cardId}" data-idx="${idx}" data-field="description" placeholder="Description du cas..."
          rows="2" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--muted);color:#8ab4c4;font-size:14px;font-family:'Syne',sans-serif;outline:none;padding:2px 0 8px;resize:none;overflow:hidden;line-height:1.6">${safeDesc}</textarea>
      </div>
      <div style="padding:4px 16px 14px">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:6px">RÉSULTAT ATTENDU</div>
        <textarea data-card="${cardId}" data-idx="${idx}" data-field="expected" placeholder="Résultat attendu..."
          rows="2" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--muted);color:var(--teal);font-size:14px;font-family:'IBM Plex Mono',monospace;outline:none;padding:2px 0 8px;resize:none;overflow:hidden;line-height:1.6">${safeExp}</textarea>
      </div>
    </div>`;
  }).join('');

  // ── New multi-page innerHTML ──────────────────────────────────────────────
  // Ensure TC_STORE has pages
  if (!TC_STORE[cardId].pages) {
    // Use blockLabel from TC_STORE if available, else hostname, else default
    const initLabel = TC_STORE[cardId].pageLabel || hostname || 'Page principale';
    TC_STORE[cardId].pages = [{ label: initLabel, cases: [...cases] }];
  } else {
    // Pages already restored from localStorage — don't overwrite
  }
  const storeRef = TC_STORE[cardId];

  function buildPageCase(c, pi, idx) {
    // Always use stored testId — never auto-generate unless missing
    if (!c.testId) c.testId = 'TC_' + String(idx+1).padStart(3,'0');
    const tid   = escHtml(c.testId);
    const nm    = escHtml(c.name || '');
    const desc  = escHtml(c.description || '');
    const exp   = escHtml(c.expected || '');
    return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="background:rgba(0,212,170,0.15);color:var(--teal);font-family:'IBM Plex Mono',monospace;font-size:10px;padding:2px 8px;border-radius:4px;border:1px solid rgba(0,212,170,0.3);white-space:nowrap;font-weight:700">${tid}</span>
        <input data-card="${cardId}" data-pi="${pi}" data-ci="${idx}" data-field="name" value="${nm}" placeholder="Nom du cas"
          style="flex:1;background:transparent;border:none;color:var(--text);font-weight:700;font-size:14px;font-family:'Syne',sans-serif;outline:none;min-width:0" />
        <button data-card="${cardId}" data-pi="${pi}" data-ci="${idx}" data-action="del-case"
          style="background:rgba(230,57,70,0.12);border:1px solid rgba(230,57,70,0.3);color:#DC2626;width:26px;height:26px;border-radius:4px;font-size:13px;cursor:pointer;flex-shrink:0" title="Fermer">✕</button>
      </div>
      <div style="padding:8px 12px 4px">
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:4px">DESCRIPTION</div>
        <textarea data-card="${cardId}" data-pi="${pi}" data-ci="${idx}" data-field="description" rows="2"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--muted);color:#8ab4c4;font-size:13px;font-family:'Syne',sans-serif;outline:none;padding:2px 0 6px;resize:vertical;min-height:36px;line-height:1.6">${desc}</textarea>
      </div>
      <div style="padding:4px 12px 10px">
        <div style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:4px">RÉSULTAT ATTENDU</div>
        <textarea data-card="${cardId}" data-pi="${pi}" data-ci="${idx}" data-field="expected" rows="1"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--muted);color:var(--teal);font-size:13px;font-family:'IBM Plex Mono',monospace;outline:none;padding:2px 0 6px;resize:vertical;min-height:28px;line-height:1.6">${exp}</textarea>
      </div>
    </div>`;
  }

  const pagesHtml = storeRef.pages.map((pg, pi) => {
    const pgLabel = escHtml(pg.label || ('Page ' + (pi+1)));
    const pgCases = (pg.cases||[]).map((c, ci) => buildPageCase(c, pi, ci)).join('');
    const canDel  = storeRef.pages.length > 1;
    return `<div style="margin-bottom:14px;border:1px solid rgba(0,212,170,0.18);border-radius:10px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:8px;padding:9px 14px;background:rgba(0,212,170,0.05);border-bottom:1px solid rgba(0,212,170,0.15)">
        <span style="font-size:10px;color:var(--teal);font-family:'IBM Plex Mono',monospace;font-weight:700;flex-shrink:0">📄 PAGE ${pi+1}</span>
        <input data-card="${cardId}" data-pi="${pi}" data-field="pagelabel" value="${pgLabel}" placeholder="Nom de la page..."
          style="flex:1;background:transparent;border:none;border-bottom:1px solid transparent;color:var(--text);font-size:13px;font-weight:600;font-family:'Syne',sans-serif;outline:none;padding:2px 4px"
          onfocus="this.style.borderBottomColor='var(--teal)'" onblur="this.style.borderBottomColor='transparent'" />
        <span style="font-size:10px;color:var(--gray);font-family:'IBM Plex Mono',monospace">${pg.cases.length} cas</span>
        ${canDel ? `<button data-card="${cardId}" data-pi="${pi}" data-action="del-page"
          style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:11px;padding:2px 5px"
          onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray)'" title="Supprimer cette page" title="Fermer">✕</button>` : ''}
      </div>
      <div style="padding:10px 12px">
        ${pgCases}
        <button data-card="${cardId}" data-pi="${pi}" data-action="add-case"
          style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);color:#60a5fa;padding:5px 12px;border-radius:6px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          + Ajouter un cas
        </button>
      </div>
    </div>`;
  }).join('');

  const totalCases = storeRef.pages.reduce((s, p) => s + (p.cases||[]).length, 0);

  el.innerHTML = `
    <div class="msg-avatar" style="margin-top:4px">🤖</div>
    <div class="msg-body" style="width:100%;max-width:100%">
      <div class="msg-bubble" style="padding:16px 20px;resize:horizontal;overflow:auto;min-width:340px;max-width:100%;box-sizing:border-box">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
          <strong style="font-size:15px">📋 ${totalCases} cas — ${storeRef.pages.length} page${storeRef.pages.length>1?'s':''} POM${hostname?` <span class="tag rf">🌐 ${hostname}</span>`:''}</strong>
        </div>
        <div id="tc-pages-${cardId}">${pagesHtml}</div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;padding-top:12px;border-top:1px solid var(--border)">
          <button data-card="${cardId}" data-action="add-page"
            style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:8px 14px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Ajouter une nouvelle page POM">+ Ajouter une page</button>
          <button data-card="${cardId}" data-action="select-blocks"
            style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);color:#60a5fa;padding:8px 14px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Sélectionner des blocs à fusionner" title="Sélectionner des blocs à fusionner">☑ Sélectionner</button>

          <button data-card="${cardId}" data-action="downloadcsv"
            style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);color:#22c55e;padding:8px 12px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Télécharger les cas de tests en CSV Excel">⬇️ CSV</button>
          <button data-card="${cardId}" data-action="copy"
            style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);padding:8px 14px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Copier tous les cas de tests">📋 Copier</button>
          <button data-card="${cardId}" data-action="generate"
            style="background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;padding:8px 18px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer;font-weight:700" title="Générer le code Robot Framework">⚡ Générer le code RF</button>
          <button data-card="${cardId}" data-action="cancel"
            style="background:rgba(230,57,70,0.08);border:1px solid var(--red);color:var(--red);padding:8px 12px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Supprimer ce bloc de cas de tests">✕</button>
        </div>
      </div>
    </div>`;

  // Event delegation
  el.addEventListener('input', e => {
    const t = e.target;
    if (!t.dataset.card) return;
    const pi = t.dataset.pi !== undefined ? parseInt(t.dataset.pi) : -1;
    const ci = t.dataset.ci !== undefined ? parseInt(t.dataset.ci) : -1;
    if (t.dataset.field === 'pagelabel' && pi >= 0 && storeRef.pages[pi]) {
      storeRef.pages[pi].label = t.value;
    } else if (pi >= 0 && ci >= 0 && storeRef.pages[pi]?.cases[ci]) {
      storeRef.pages[pi].cases[ci][t.dataset.field] = t.value;
    } else if (t.dataset.idx !== undefined) {
      tcUpdate(t.dataset.card, parseInt(t.dataset.idx), t.dataset.field, t.value);
    }
    syncStoreToPending(t.dataset.card);
  }, { once: false });

  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const cid    = btn.dataset.card;
    const action = btn.dataset.action;
    const pi     = btn.dataset.pi !== undefined ? parseInt(btn.dataset.pi) : -1;
    const ci     = btn.dataset.ci !== undefined ? parseInt(btn.dataset.ci) : -1;
    const stC = TC_STORE[cid];
    // Allow select-blocks and merge-all even without TC_STORE entry
    if (!stC && action !== 'select-blocks' && action !== 'merge-all') return;
    const st = stC;

    if (action === 'del-case' && pi >= 0 && ci >= 0) {
      st.pages[pi].cases.splice(ci, 1);
      syncStoreToPending(cid); rebuildCard(cid);
    } else if (action === 'del-page' && pi >= 0) {
      st.pages.splice(pi, 1);
      syncStoreToPending(cid); rebuildCard(cid);
    } else if (action === 'add-case' && pi >= 0) {
      const n = st.pages[pi].cases.length + 1;
      st.pages[pi].cases.push({ id: n, testId: 'TC_' + String(n).padStart(3,'0'), name: 'Nouveau cas', description: '', expected: '' });
      syncStoreToPending(cid); rebuildCard(cid);
    } else if (action === 'add-page') {
      st.pages.push({ label: 'Page ' + (st.pages.length + 1), cases: [{ id: 1, testId: 'TC_001', name: 'Nouveau cas', description: '', expected: '' }] });
      syncStoreToPending(cid); rebuildCard(cid);
    } else if (action === 'copy')           tcCopy(cid);
    else if (action === 'generate')         generateCodeFromCard(cid, document.getElementById('apiKey').value.trim());
    else if (action === 'downloadcsv')      downloadCasesCSV(cid);
    else if (action === 'select-blocks')    { openBlockSelector(cid); return; }
    else if (action === 'merge-all')        { mergeAllCards(cid); return; }
    else if (action === 'cancel')           tcCancelAll(cid);
    else if (action === 'delete')           tcDelete(cid, parseInt(btn.dataset.idx));
    else if (action === 'add')              tcAdd(cid);
  });
}


// TC actions

function downloadCasesCSV(cardId) {
  const cases = pendingTestCases?.cases || TC_STORE[cardId]?.cases;
  if (!cases) return;

  const headers = ['Test_ID', 'Nom', 'Description', 'Résultat attendu'];
  const rows    = cases.map(c => [
    c.testId || ('TC_' + String(c.id).padStart(3,'0')),
    c.name        || '',
    c.description || '',
    c.expected    || '',
  ].map(v => '"' + String(v).replace(/"/g, '""') + '"'));

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const bom = '\uFEFF'; // UTF-8 BOM for Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cas_de_tests_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('⬇️ CSV téléchargé — ouvrable dans Excel');
}




// ── Block selector modal ──────────────────────────────────────────────────────
function openBlockSelector(targetCardId) {
  console.log('[BlockSelector] targetCardId:', targetCardId);
  console.log('[BlockSelector] TC_STORE keys:', Object.keys(TC_STORE));
  const otherCards = Object.keys(TC_STORE).filter(id => id !== targetCardId);
  console.log('[BlockSelector] otherCards:', otherCards);
  if (otherCards.length === 0) {
    showToast('⚠️ Aucun autre bloc disponible dans le chat');
    return;
  }

  document.getElementById('blockSelectorModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'blockSelectorModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px';

  const rows = otherCards.map(cardId => {
    const store = TC_STORE[cardId];
    if (!store) return '';
    const pages = store.pages || [{ label: store.pageLabel || 'Page', cases: store.cases || [] }];
    const totalCases = pages.reduce((s,p) => s + (p.cases||[]).length, 0);
    const pageLabels = pages.map(p => p.label).join(', ');
    return `<label style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--card);
              border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;transition:border-color .15s"
              onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
      <input type="checkbox" value="${cardId}" class="block-select-cb"
        style="accent-color:var(--teal);width:16px;height:16px;flex-shrink:0;margin-top:2px;cursor:pointer" />
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px">${escHtml(pageLabels)}</div>
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace">
          ${pages.length} page${pages.length>1?'s':''} · ${totalCases} cas de tests
        </div>
      </div>
    </label>`;
  }).join('');

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:520px;overflow:hidden;display:flex;flex-direction:column">
      <!-- Header -->
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">☑ Sélectionner des blocs à fusionner</span>
        <button onclick="document.getElementById('blockSelectorModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer" title="Fermer">✕</button>
      </div>
      <!-- Bloc list -->
      <div style="padding:16px 20px;max-height:360px;overflow-y:auto">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:12px">
          BLOCS DISPONIBLES — coche ceux à fusionner dans le bloc actuel
        </div>
        ${rows}
      </div>
      <!-- Footer -->
      <div style="display:flex;gap:10px;padding:14px 20px;border-top:1px solid var(--border);background:var(--card)">
        <button onclick="mergeSelectedBlocks('${targetCardId}')"
          style="flex:1;background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;
                 padding:10px 20px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          🔀 Fusionner la sélection
        </button>
        <button onclick="document.getElementById('blockSelectorModal').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:10px 16px;
                 border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          Annuler
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);
}

function mergeSelectedBlocks(targetCardId) {
  const targetStore = TC_STORE[targetCardId];
  if (!targetStore) return;

  // Ensure target has pages
  if (!targetStore.pages) {
    targetStore.pages = [{ label: targetStore.pageLabel || 'Page principale', cases: [...(targetStore.cases||[])] }];
  }

  const checked = [...document.querySelectorAll('.block-select-cb:checked')];
  if (checked.length === 0) { showToast('⚠️ Coche au moins un bloc'); return; }

  let merged = 0;
  checked.forEach(cb => {
    const srcId    = cb.value;
    const srcStore = TC_STORE[srcId];
    if (!srcStore) return;

    if (!srcStore.pages) {
      srcStore.pages = [{ label: srcStore.pageLabel || 'Page importée', cases: [...(srcStore.cases||[])] }];
    }

    srcStore.pages.forEach(page => {
      if (!page.cases || page.cases.length === 0) return;
      const pageLabel = page.label && page.label !== 'Page principale' ? page.label : (srcStore.pageLabel || 'Page importée');

      // Check if a page with same label already exists in target
      const existingPage = targetStore.pages.find(p =>
        p.label.toLowerCase().trim() === pageLabel.toLowerCase().trim()
      );

      // Deduplicate cases by name
      const existingNames = new Set(
        (existingPage ? existingPage.cases : targetStore.pages.flatMap(p => p.cases||[]))
          .map(c => (c.name||'').toLowerCase().trim())
      );

      // For different apps (different URL/pageLabel), allow same name
      // For same app, deduplicate by name
      const srcAppLabel = srcStore.pageLabel || '';
      const tgtAppLabel = targetStore.pageLabel || '';
      const sameApp = srcAppLabel && tgtAppLabel &&
        srcAppLabel.toLowerCase().replace(/[^a-z0-9]/g,'') ===
        tgtAppLabel.toLowerCase().replace(/[^a-z0-9]/g,'');

      const newCases = sameApp
        ? page.cases.filter(c => !existingNames.has((c.name||'').toLowerCase().trim()))
        : page.cases; // different apps — keep all cases even if same name

      if (newCases.length === 0) return; // all duplicates, skip

      if (existingPage) {
        // Merge into existing page
        existingPage.cases.push(...newCases);
      } else {
        // New page
        targetStore.pages.push({ label: pageLabel, cases: newCases });
      }
      merged++;
    });

    // Remove source TC card and any result card immediately after it
    const srcEl = document.getElementById(srcId);
    if (srcEl) {
      // Remove next sibling result cards (code cards generated from this TC block)
      let next = srcEl.nextElementSibling;
      while (next && next.classList.contains('msg') && next.querySelector('.msg-bubble[style*="padding:0"]')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
      srcEl.remove();
    }
    delete TC_STORE[srcId];
  });

  if (merged === 0) { showToast('⚠️ Aucune page à fusionner'); return; }

  // Renumber testIds sequentially — names stay untouched
  let seqIdx = 1;
  targetStore.pages.forEach(p => {
    (p.cases||[]).forEach(c => {
      c.testId = 'TC_' + String(seqIdx).padStart(3,'0');
      // c.name is NEVER modified
      seqIdx++;
    });
  });

  // Clear saved code cards — will be regenerated
  // Ne supprimer que les cartes de code (multi) — garder les rapports et suite-reports
  window._codeCards = (window._codeCards||[]).filter(c => c.type === 'report' || c.type === 'suite-report');

  document.getElementById('blockSelectorModal')?.remove();
  syncStoreToPending(targetCardId);
  rebuildCard(targetCardId);
  const inp = document.getElementById('userInput');
  if (inp) { inp.value = ''; inp.style.height = 'auto'; }
  showToast('🔀 ' + merged + ' page(s) fusionnée(s) — prêt à générer le code RF');
}

// ── Merge all TC cards in the chat into one ───────────────────────────────────
function mergeAllCards(targetCardId) {
  const targetStore = TC_STORE[targetCardId];
  if (!targetStore) return;

  // Ensure target has pages
  if (!targetStore.pages) {
    targetStore.pages = [{ label: targetStore.pageLabel || 'Page principale', cases: [...(targetStore.cases||[])] }];
  }

  let merged = 0;

  Object.keys(TC_STORE).forEach(cardId => {
    if (cardId === targetCardId) return;
    const srcStore = TC_STORE[cardId];
    if (!srcStore) return;

    // Ensure source has pages
    if (!srcStore.pages) {
      srcStore.pages = [{ label: srcStore.pageLabel || 'Page importée', cases: [...(srcStore.cases||[])] }];
    }
    const srcPages = srcStore.pages;

    srcPages.forEach(page => {
      if (page.cases && page.cases.length > 0) {
        // Add as new page in target
        targetStore.pages.push({
          label: page.label && page.label !== 'Page principale' ? page.label : (srcStore.pageLabel || 'Page importée'),
          cases: page.cases.map((c, i) => ({
            ...c,
            testId: c.testId || ('TC_' + String(i+1).padStart(3,'0')),
          })),
        });
        merged++;
      }
    });

    // Remove source TC card AND its associated result cards
    const srcEl = document.getElementById(cardId);
    if (srcEl) {
      let next = srcEl.nextElementSibling;
      while (next && next.classList.contains('msg') && next.querySelector('.msg-bubble[style*="padding:0"]')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
      srcEl.remove();
    }
    delete TC_STORE[cardId];
  });

  if (merged === 0) {
    showToast('⚠️ Aucun autre bloc à fusionner');
    return;
  }

  // Renumber all testIds across all pages
  let globalIdx = 1;
  targetStore.pages.forEach(page => {
    page.cases.forEach(c => {
      c.testId = 'TC_' + String(globalIdx).padStart(3, '0');
      globalIdx++;
    });
  });

  syncStoreToPending(targetCardId);
  rebuildCard(targetCardId);
  showToast('🔀 ' + merged + ' page(s) fusionnée(s) dans ce bloc');
}

function syncStoreToPending(cardId) {
  const store = TC_STORE[cardId];
  if (!store) return;
  const allCases = store.pages ? store.pages.flatMap(p => p.cases) : store.cases;
  if (pendingTestCases) { pendingTestCases.cases = allCases; pendingTestCases.pages = store.pages; }
  store.cases = allCases;
  saveSuiteRegistry && saveSuiteRegistry();
  LS.save();
  saveTCStore();
}

function saveTCStore() {
  try {
    const light = {};
    Object.keys(TC_STORE).forEach(id => {
      if (!document.getElementById(id)) return;
      const s = TC_STORE[id];
      light[id] = { cases: s.cases, url: s.url, pages: s.pages, pageLabel: s.pageLabel };
    });
    localStorage.setItem('qa_tc_store', JSON.stringify(light));
    // Verify immediately
    const verify = JSON.parse(localStorage.getItem('qa_tc_store'));
  } catch(e) { console.error('[saveTCStore] error', e); }
}

function tcUpdate(cardId, idx, field, value) {
  if (TC_STORE[cardId]) TC_STORE[cardId].cases[idx][field] = value;
  if (pendingTestCases) pendingTestCases.cases[idx][field] = value;
  LS.save();
}

function tcDelete(cardId, idx) {
  if (!TC_STORE[cardId]) return;
  TC_STORE[cardId].cases.splice(idx, 1);
  TC_STORE[cardId].cases.forEach((c, i) => c.id = i + 1);
  if (pendingTestCases) { pendingTestCases.cases = [...TC_STORE[cardId].cases]; LS.save(); }
  rebuildCard(cardId);
}

function tcAdd(cardId) {
  if (!TC_STORE[cardId]) return;
  const cases = TC_STORE[cardId].cases;
  cases.push({ id: cases.length + 1, name: 'Nouveau cas', description: '', expected: '' });
  if (pendingTestCases) { pendingTestCases.cases = [...cases]; LS.save(); }
  rebuildCard(cardId);
}

function tcCopy(cardId) {
  const cases = TC_STORE[cardId]?.cases || pendingTestCases?.cases;
  if (!cases) return;
  const text = cases.map(c =>
    'TC-' + c.id + ' — ' + c.name + '\nDescription : ' + c.description + '\nRésultat attendu : ' + c.expected
  ).join('\n\n');
  navigator.clipboard.writeText(text).then(() => showToast('📋 Cas copiés !'));
}

function tcCancelAll(cardId) {
  showConfirmDialog('🗑 Supprimer le bloc', 'Supprimer ce bloc de cas de tests ?', () => {
    pendingTestCases = null;
    pendingBlocks = [];
    delete TC_STORE[cardId];
    try {
      localStorage.removeItem('qa_agent_pending');
      saveTCStore();
      LS.save();
    } catch(e) {}
    const el = document.getElementById(cardId);
    if (el) el.remove();
    showToast('🗑 Bloc supprimé');
  });
}



// ── Generate RF code from a specific card (not just pendingTestCases) ─────────
async function generateCodeFromCard(cardId, apiKey) {
  if (!apiKey || false /* provider key check disabled */) {
    showToast('⚠️ Configure ta clé API');
    return;
  }
  const store = TC_STORE[cardId];
  if (!store) { showToast('⚠️ Bloc introuvable'); return; }

  // Ensure pages exist
  if (!store.pages) {
    store.pages = [{ label: store.pageLabel || 'Page principale', cases: [...(store.cases||[])] }];
  }

  const library = document.getElementById('optLibrary').value;
  const style   = document.getElementById('optStyle').value;
  const mode    = 'multi';

  // Build description from ALL pages — include every single case
  const formatCase = c =>
    (c.testId||c.id) + ' — ' + (c.name||'') +
    '\nDescription : ' + (c.description||'—') +
    '\nAttendu : ' + (c.expected||'—');

  const description = store.pages.length > 1
    ? store.pages.map((p, pi) =>
        '=== PAGE ' + (pi+1) + ' : ' + (p.label||'Page') + ' (' + (p.cases||[]).length + ' cas) ===\n' +
        (p.cases||[]).map(formatCase).join('\n\n')
      ).join('\n\n')
    : (store.pages[0]?.cases||[]).map(formatCase).join('\n\n');

  // Total case count for the prompt
  const totalCases = store.pages.reduce((s, p) => s + (p.cases||[]).length, 0);

  // Force multi-file if more than 1 page (POM)
  const effectiveMode = store.pages.length > 1 ? 'multi' : mode;
  if (store.pages.length > 1) {
    // multi mode is default
    showToast('💡 Mode Multi-fichiers activé automatiquement pour le POM');
  }

  // Prevent double generation
  if (window._generatingCode) return;
  window._generatingCode = true;

  // Clear input field
  const inputEl = document.getElementById('userInput');
  if (inputEl) { inputEl.value = ''; inputEl.style.height = 'auto'; }

  // Build title from page labels
  const pageLabels = (store.pages||[]).map(p => p.label||'Page').join(' + ');
  window._lastGeneratedTitle = pageLabels || 'Code RF';

  // Don't remove previous code cards — keep them all in chat
  // (user can close individually with ✕ button)

  showTyping();
  try {
    // Prepend explicit instruction about total number of test cases
  const caseInstruction = '⚠️ IMPORTANT : Génère EXACTEMENT ' + totalCases + ' Test Cases dans tests/tests.robot — un par cas listé ci-dessous. NE PAS en omettre.\n\n';
  const code = await callClaudeRaw(apiKey, caseInstruction + buildRfPrompt(description, library, style, effectiveMode));
    hideTyping();
    // Clear pending so nothing else triggers a second generation
    pendingTestCases = null;
    LS.save();
    const filename = 'test_' + store.pages.map(p => (p.label||'page').replace(/[^a-z0-9]/gi,'_').toLowerCase()).join('_') + '.robot';
    if (effectiveMode === 'multi') renderMultiFileMsg(code);
    else renderCodeMsg(code, filename);
  } catch(err) {
    hideTyping();
    renderAgentMsg('❌ Erreur génération : ' + err.message);
  } finally {
    window._generatingCode = false;
  }
}

// ── Multi-block POM management ────────────────────────────────────────────────
function addNewBlock() {
  // Hide global actions on all previous cards
  updateGlobalActionBars();
  // Ask user to describe next page
  const input = document.getElementById('userInput');
  if (input) {
    input.value = '';
    input.placeholder = 'Décris les cas de tests pour la prochaine page...';
    input.focus();
  }
  showToast('💡 Décris la prochaine page pour ajouter un bloc');
}

function updateGlobalActionBars() {
  // Hide global actions on all cards except last
  const allGlobal = document.querySelectorAll('[id^="globalActions-"]');
  allGlobal.forEach((el, i) => {
    el.style.display = i === allGlobal.length - 1 ? 'flex' : 'none';
  });
}

// generateCodeFromCases is unified — generateCodeFromCard handles per-card logic

async function generatePOMFromBlocks(apiKey) {
  if (!pendingBlocks.length) return;

  const library = document.getElementById('optLibrary').value;
  const style   = document.getElementById('optStyle').value;

  showTyping();

  // Build description with all blocks
  const blocksDesc = pendingBlocks.map((b, i) => {
    const label = document.getElementById('blockLabel-' + b.blockId)?.value || b.pageLabel || ('Page ' + (i+1));
    return `=== PAGE : ${label} ===\n` +
      b.cases.map(c => `${c.testId||'TC_'+(c.id||i)} — ${c.name}\nDescription : ${c.description}\nAttendu : ${c.expected}`).join('\n\n');
  }).join('\n\n');

  const description = `Architecture POM avec ${pendingBlocks.length} pages :\n\n${blocksDesc}`;

  try {
    const code = await callClaudeRaw(apiKey, buildRfPrompt(description, library, style, 'multi'));
    hideTyping();
    pendingTestCases = null;
    pendingBlocks    = [];
    LS.save();
    renderMultiFileMsg(code);
  } catch(err) {
    hideTyping();
    renderAgentMsg('❌ Erreur génération POM : ' + err.message);
  }
}

// ── STEP 2 : Générer le code RF depuis les cas en attente ─────────────────────
async function generateCodeFromCases(apiKey) {
  // Get key from DOM if not passed (called from sidebar button)
  if (!apiKey) apiKey = document.getElementById('apiKey').value.trim();
  if (!apiKey || false /* provider key check disabled */) {
    showToast('⚠️ Configure ta clé API ' + getCurrentProvider() + ' en haut à droite');
    return;
  }
  if (!pendingTestCases || window._generatingCode) {
    if (!pendingTestCases) renderAgentMsg("⚠️ Aucun cas de tests en attente. Décris d'abord ce que tu veux tester.");
    return;
  }

  const { userText, url, username, password, cases } = pendingTestCases;
  const library = document.getElementById('optLibrary').value;
  const style   = document.getElementById('optStyle').value;
  const mode    = 'multi';

  const casesList = cases.map(c =>
    `Cas ${c.id} — ${c.name} : ${c.description} → Résultat attendu : ${c.expected}`
  ).join('\n');

  const description = `${url ? `URL : ${url}\n` : ''}${username ? `Username : ${username}\n` : ''}${password ? `Password : ${password}\n` : ''}\nCas de tests à implémenter :\n${casesList}`;

  showTyping();

  try {
    const code = await callClaudeRaw(apiKey, buildRfPrompt(description, library, style, mode));
    hideTyping();
    pendingTestCases = null;
    LS.save();
    const filename = url
      ? `test_${new URL(url).pathname.replace(/\W+/g,'_').replace(/^_|_$/g,'') || new URL(url).hostname.split('.')[0]}.robot`
      : 'test_generated.robot';
    if (mode === 'multi') renderMultiFileMsg(code);
    else renderCodeMsg(code, filename);
  } catch(err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur génération : ${err.message}`);
  }
}

// ── Azure connect — direct browser call ───────────────────────────────────────
function parseAzureUrl(url) {
  const parsed = new URL(url.trim());
  const parts  = parsed.pathname.replace(/^\//, '').split('/').filter(Boolean);
  let org, project;
  if (parsed.hostname === 'dev.azure.com') { org = parts[0]; project = parts[1]; }
  else { org = parsed.hostname.split('.')[0]; project = parts[0]; }
  return { org, project };
}

async function azureFetch(path, token) {
  const b64 = btoa(`:${token}`);
  const r = await fetch(path, {
    headers: {
      'Authorization': `Basic ${b64}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return r;
}

async function handleAzureConnect(url, token, apiKey, originalMsg) {
  showTyping();
  try {
    const { org, project } = parseAzureUrl(url);
    if (!org || !project) {
      hideTyping();
      renderAgentMsg('❌ URL invalide. Format attendu : `https://dev.azure.com/organisation/projet`');
      return;
    }

    const testUrl = `https://dev.azure.com/${org}/${project}/_apis/wit/workitems?$top=1&api-version=7.0`;
    const r = await azureFetch(testUrl, token);
    hideTyping();

    if (r.status === 401) { renderAgentMsg('❌ Token invalide ou accès refusé.'); return; }
    if (r.status === 404) { renderAgentMsg(`❌ Projet "${project}" introuvable dans "${org}".`); return; }
    if (!r.ok)            { renderAgentMsg(`❌ Erreur Azure DevOps : HTTP ${r.status}`); return; }

    azureSession = { org, project, token };
    LS.save();
    renderAgentMsg(`✅ Connecté à Azure DevOps !\n\n<span class="tag azure">📁 ${org}</span> <span class="tag rf">🗂 ${project}</span>\n\nQuel numéro d'US veux-tu récupérer ?`);

  } catch(err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur de connexion : ${err.message}\n\nSi tu vois une erreur CORS, ton organisation bloque les appels directs — contacte ton admin Azure DevOps pour activer l'accès CORS ou utilise un PAT avec les droits corrects.`);
  }
}

// ── Fetch US + optionally generate — direct browser call ──────────────────────
async function handleFetchAndGenerate(id, shouldGenerate, apiKey, originalMsg) {
  showTyping();
  try {
    const { org, project, token } = azureSession;
    const fields = [
      'System.Id','System.Title','System.Description','System.WorkItemType',
      'System.State','Microsoft.VSTS.Common.AcceptanceCriteria','System.Tags',
    ].join(',');
    const url = `https://dev.azure.com/${org}/${project}/_apis/wit/workitems/${id}?fields=${fields}&api-version=7.0`;
    const r   = await azureFetch(url, token);
    const data = await r.json();
    hideTyping();

    if (!r.ok) {
      renderAgentMsg(`❌ Work Item #${id} introuvable : ${data.message || r.status}`);
      return;
    }

    const f  = data.fields;
    const us = {
      id:         data.id,
      type:       f['System.WorkItemType'],
      title:      f['System.Title'],
      description:f['System.Description'] || '',
      acceptance: f['Microsoft.VSTS.Common.AcceptanceCriteria'] || '',
      state:      f['System.State'],
      tags:       f['System.Tags'] || '',
    };

    // Show US card
    const cardHtml = renderUsCard(us);
    const div = document.createElement('div');
    div.className = 'msg agent';
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="msg-bubble">
          J'ai récupéré l'US #${id} :${cardHtml}
          ${shouldGenerate ? '<br>Je génère les tests RF maintenant...' : 'Tu veux que je génère les tests RF pour cette US ?'}
        </div>
      </div>`;
    document.getElementById('messages').appendChild(div);
    chatHistory.push({ role: 'assistant', content: `[US Card #${id}: ${us.title}]` });
    LS.save();
    scrollToBottom();

    if (shouldGenerate) {
      await generateTestCasesFromIssue(us, apiKey);
    }

  } catch(err) {
    hideTyping();
    if (err.message.includes('fetch') || err.message.includes('Failed')) {
      renderAgentMsg(`❌ Serveur proxy non démarré.\n\nLance **\`node server.js\`** dans ton terminal.`);
    } else {
      renderAgentMsg(`❌ Erreur : ${err.message}`);
    }
  }
}

// ── Generate RF from US ────────────────────────────────────────────────────────
async function generateFromUs(us, apiKey) {
  showTyping();

  const library = document.getElementById('optLibrary').value;
  const style   = document.getElementById('optStyle').value;
  const mode    = 'multi';

  const prompt = buildRfPrompt(
    `US #${us.id} : ${us.title}\n\n` +
    (stripHtml(us.description) ? `Description :\n${stripHtml(us.description)}\n\n` : '') +
    (stripHtml(us.acceptance)  ? `Critères d'acceptance :\n${stripHtml(us.acceptance)}` : ''),
    library, style, mode
  );

  try {
    const code = await callClaudeRaw(apiKey, prompt);
    hideTyping();

    if (mode === 'multi') {
      renderMultiFileMsg(code);
    } else {
      renderCodeMsg(code, `test_us_${us.id}.robot`);
    }

  } catch(err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur génération : ${err.message}`);
  }
}

// ── Call Claude (conversational) ───────────────────────────────────────────────
async function callClaude(apiKey, userText) {
  const library = document.getElementById('optLibrary')?.value || 'SeleniumLibrary';
  const style   = document.getElementById('optStyle')?.value   || 'keyword-driven';
  const system  = `Tu es un expert QA spécialisé Robot Framework. Tu aides à générer, analyser et améliorer des tests automatisés. Sois concis et pratique. Si on te demande de générer des tests RF, génère-les directement. ${getSessionRules()}`;

  // Build messages with history — filter out system/invalid/non-string messages
  const messages = [
    ...chatHistory.slice(-10).filter(m =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.trim().length > 0 &&
      !m.content.startsWith('[Test run:') &&
      !m.content.startsWith('[RF code:') &&
      !m.content.startsWith('[Test cases:')
    ),
    { role: 'user', content: userText },
  ];

  return await callAI(apiKey, messages, system, 2048);
}


// ── Call Claude for RF generation (raw code output) ───────────────────────────

// ── Haiku API call — fast, for TC generation (JSON responses) ─────────────────
async function callClaudeHaiku(apiKey, prompt) {
  return await callAI(apiKey, [{ role: 'user', content: prompt }], null, 2048);
}


// ── Build RF prompt ────────────────────────────────────────────────────────────

// ── Session mode rules for RF prompts ────────────────────────────────────────
function getSessionRules() {
  const mode = document.getElementById('optBrowserSession')?.value || 'per-test';
  const openBrowserKw = 'Open Browser No Popup';
  const openBrowserDef =
    '\n*** Keywords ***' +
    '\nOpen Browser No Popup' +
    '\n    [Arguments]    ${url}    ${browser}=chrome' +
    '\n    ${opts}=    Evaluate    __import__(\'no_popup\').create_chrome_options()' +
    '\n    Open Browser    ${url}    ${browser}    options=${opts}';

  if (mode === 'per-suite') {
    return 'SESSION=SUITE_TEARDOWN: '
      + 'Use keyword "Open Browser No Popup" in Suite Setup (not Open Browser directly). '
      + 'Close Browser once in Suite Teardown. '
      + 'DO NOT add Open Browser or Close Browser in any test case or keyword. '
      + 'Use Go To for navigation in tests. '
      + 'Settings must have: Suite Setup    Open Browser No Popup    ${URL}    ${BROWSER} and Suite Teardown    Close Browser. '
      + 'Add this keyword definition in keywords.robot: ' + openBrowserDef;
  } else {
    return 'SESSION=TEST_TEARDOWN: '
      + 'Use keyword "Open Browser No Popup" instead of Open Browser directly. '
      + 'Add Test Teardown    Close Browser in Settings. '
      + 'Each test case must call Open Browser No Popup at start. '
      + 'Add this keyword definition in keywords.robot: ' + openBrowserDef;
  }
}

function buildRfPrompt(description, library, style, mode) {
  // Library-specific prompts — no POM for API/DB
  if (library === 'RequestsLibrary') {
    return buildRfPromptAPI(description, style);
  }
  if (library === 'DatabaseLibrary') {
    return buildRfPromptDB(description, style);
  }
  if (library === 'AppiumLibrary') {
    return buildRfPromptMobile(description, style);
  }

  // In multi-file mode, enforce POM structure with resources/ folder
  if (mode === 'multi') {
    return buildRfPromptPOM(description, library, style);
  }
  // Browser (Playwright) specific prompt
  if (library === 'Browser') {
    return buildRfPromptBrowser(description, style);
  }

  const styleMap = {
    'keyword-driven': 'Keyword-Driven with a clean reusable *** Keywords *** section.',
    'data-driven':    'Data-Driven with a Template and data sets.',
    'bdd':            'BDD with Given/When/Then/And/But prefixes in ENGLISH only.',
  };

  const modeInstr = mode === 'multi'
    ? `Génère PLUSIEURS fichiers séparés par des délimiteurs exactement comme ceci :
***** FILE: resources/variables.robot | variables | Variables globales
[contenu]

***** FILE: resources/keywords.robot | keywords | Keywords réutilisables
[contenu]

***** FILE: tests/test_sujet.robot | tests | Tests principaux
[contenu]`
    : 'Génère UN SEUL fichier .robot complet.';

  return `Tu es un expert Robot Framework. Réponds UNIQUEMENT avec le code .robot, aucune explication.

${modeInstr}

Règles :
- Librairie : ${library}
- Style : ${styleMap[style]}
- Variables externalisées dans *** Variables ***
- [Documentation] sur chaque test case
- [Teardown] quand un browser est ouvert
- Sélecteurs réalistes : id:, css:, xpath:
- Couvre tous les cas décrits + edge cases pertinents

Sujet à tester :
${description}`;
}


// ── RequestsLibrary prompt ───────────────────────────────────────────────────


function buildRfPromptBrowser(description, style) {
  const bdd = style === 'bdd';
  const lines = [
    'You are a Robot Framework expert using Browser library (Playwright).',
    'Generate plain text only. NO markdown. ALL keyword names in English.',
    '',
    'DESCRIPTION:',
    description,
    '',
    '*** Settings ***',
    'Library    Browser',
    'Library    Collections',
    '',
    '*** Variables ***',
    '${BASE_URL}    https://example.com',
    '${BROWSER}     chromium    # Options: chromium, firefox, webkit — NOT chrome',
    '${HEADLESS}    false',
    '',
    '*** Keywords ***',
    '# Browser library keywords (NOT SeleniumLibrary):',
    '# New Browser    chromium    headless=${HEADLESS}',
    '# New Page    ${URL}',
    '# Fill Text    css=#username    tomsmith',
    '# Click    css=button[type="submit"]',
    '# Wait For Elements State    css=#flash    visible    timeout=10s',
    '# Get Text    css=#flash  → returns string',
    '# Take Screenshot    (NOT Capture Page Screenshot)',
    '# Close Browser',
    '',
    '# RULES for keywords with arguments:',
    '# Always define [Arguments] and use them: NEVER call a keyword without its required args',
    '# Example:',
    '# Enter Credentials',
    '#     [Arguments]    ${username}    ${password}',
    '#     Fill Text    css=#username    ${username}',
    '#     Fill Text    css=#password    ${password}',
    '',
    '*** Test Cases ***',
    '# Each test case calls keywords WITH their arguments',
    '',
    'RULES:',
    '- Use Browser library keywords: Fill Text NOT Input Text, Click NOT Click Element',
    '- Take Screenshot NOT Capture Page Screenshot',
    '- New Browser + New Page to open, Close Browser to close',
    '- Suite Setup: New Browser | Suite Teardown: Close Browser',
    '- CSS selectors: css=#id  css=.class  css=button[type="submit"]',
    '- ALWAYS pass arguments when calling keywords that have [Arguments]',
    '- Add [Documentation] to every keyword and [Documentation]+[Tags] to every test case',
    '- Align columns with spaces for readability',
    bdd ? '- Given/When/Then/And in English' : '',
    getSessionRules(),
  ];
  return lines.filter(l => l !== false).join('\n');
}

function buildRfPromptMobile(description, style) {
  const bdd = style === 'bdd';
  const lines = [
    'You are a Robot Framework expert for mobile web testing with AppiumLibrary.',
    'Generate plain text only. NO markdown. ALL keyword names in English.',
    'Testing a WEBSITE on a real Android device via Chrome browser — NOT a native app.',
    '',
    'DESCRIPTION:',
    description,
    '',
    '*** Settings ***',
    'Library    AppiumLibrary',
    'Library    Collections',
    '',
    '*** Variables ***',
    '${APPIUM_SERVER}    http://127.0.0.1:4723',
    '${PLATFORM}         Android',
    '${DEVICE_NAME}      R92W40HP83N',
    '${AUTOMATION}       UiAutomator2',
    
    '# Web selectors — same as SeleniumLibrary but prefixed with id: or xpath:',
    '# Example: id:username  /  xpath://button[@type="submit"]  /  css:[name="q"]',
    '',
    '*** Keywords ***',
    'Open Mobile Browser',
    '    [Arguments]    ${url}',
    '    Open Application    ${APPIUM_SERVER}',
    '    ...    platformName=${PLATFORM}',
    '    ...    deviceName=${DEVICE_NAME}',
    '    ...    automationName=${AUTOMATION}',
    '    ...    browserName=Chrome',
    
    '    Go To Url    ${url}',
    '',
    'Close Mobile Browser',
    '    Close Application',
    '',
    '# AppiumLibrary web locators — use = not : prefix:',
    '# id=elementId          (NOT id:elementId)',
    '# xpath=//tag[@attr]    (standard XPath)',
    '# css=.class or #id     (CSS selector)',
    '# Wait Until Element Is Visible    xpath=//input[@id="username"]    10s',
    '# (AppiumLibrary web: use xpath= for reliable element finding)',
    '# Input Text    xpath=//input[@id="username"]    tomsmith',
    '# Click Element    xpath=//button[@type="submit"]',
    '# Get Text    id=flash',
    '# Go To Url    https://new-url.com',
    '# Capture Page Screenshot',
    '',
    '*** Test Cases ***',
    '# Each test = one mobile web scenario',
    '# Suite Setup opens Chrome once on device, Suite Teardown closes it',
    '',
    'RULES:',
    '- Use browserName=Chrome — NO app path needed',
    '- Suite Setup: Open Mobile Browser ${url} | Suite Teardown: Close Mobile Browser',
    '- Locators MUST use = syntax: id=username  xpath=//button  css=#id',
    '- ALWAYS use xpath= format: xpath=//input[@id="username"] NOT id=username',
    '- Always Wait Until Element Is Visible before any interaction',
    '- Close browser with Close Application (NOT Close Browser)',
    '- NO APP_PATH variables',
    '- Add [Documentation] to every keyword and [Documentation]+[Tags] to every test case',
    '- Align columns with spaces for readability',
    bdd ? '- Use Given/When/Then/And in English' : '',
    getSessionRules(),
  ];
  return lines.filter(l => l !== false).join('\n');
}

function buildRfPromptAPI(description, style) {
  const bdd = style === 'bdd';
  const lines = [
    'You are a Robot Framework expert for REST API testing with RequestsLibrary.',
    'Generate plain text only. NO markdown. ALL keyword names in English.',
    '',
    'DESCRIPTION:',
    description,
    '',
    '*** Settings ***',
    'Library    RequestsLibrary',
    'Library    Collections',
    '',
    '*** Variables ***',
    '${BASE_URL}    https://api.example.com',
    '',
    '*** Keywords ***',
    '# Reusable: Create Session, GET/POST/PUT/DELETE On Session, validate status/body',
    '',
    '*** Test Cases ***',
    '# Each test = one API scenario',
    '# ${resp}=    GET On Session    alias    /endpoint',
    '# Should Be Equal As Strings    ${resp.status_code}    200',
    '',
    'RULES:',
    '- NO Open Browser or SeleniumLibrary keywords',
    '- Suite Setup: Create Session | Suite Teardown: Delete All Sessions',
    '- Validate status code AND response body',
    bdd ? '- Use Given/When/Then/And in English' : '',
  ];
  return lines.filter(l => l !== false).join('\n');
}

function buildRfPromptDB(description, style) {
  const lines = [
    'You are a Robot Framework expert for database testing with DatabaseLibrary.',
    'Generate plain text only. NO markdown. ALL keyword names in English.',
    '',
    'DESCRIPTION:',
    description,
    '',
    '*** Settings ***',
    'Library    DatabaseLibrary',
    'Library    Collections',
    '',
    '*** Variables ***',
    '${DB_MODULE}    pymysql',
    '${DB_HOST}      localhost',
    '${DB_PORT}      3306',
    '${DB_NAME}      mydb',
    '${DB_USER}      root',
    '${DB_PASS}      password',
    '',
    '*** Keywords ***',
    '# Connect To Database    ${DB_MODULE}    ${DB_NAME}    ${DB_USER}    ${DB_PASS}    ${DB_HOST}    ${DB_PORT}',
    '# Table Must Exist    tableName',
    '# Row Count Is Greater Than X    SELECT * FROM table WHERE ...    0',
    '# Disconnect From Database',
    '',
    '*** Test Cases ***',
    '# Each test = one DB scenario',
    '',
    'RULES:',
    '- NO Open Browser or SeleniumLibrary keywords',
    '- Suite Setup: connect to DB | Suite Teardown: disconnect',
    '- Validate data, row counts, column values',
    '- Add [Documentation] to every keyword and [Documentation]+[Tags] to every test case',
    '- Add comments explaining what each SQL query validates',
    getSessionRules(),
  ];
  return lines.join('\n');
}


function buildRfPromptPOM(description, library, style) {
  const styleGuide = style === 'bdd' ? 'BDD — ALL keyword names in English (Given/When/Then/And/But)' : style === 'data-driven' ? 'Data-Driven' : 'Keyword-Driven — ALL keyword names in English';

  // Detect pages from multi-block description
  const pages = [];
  description.split('=== PAGE :').slice(1).forEach(p => {
    const label = p.split('===')[0].trim();
    if (label) pages.push(label);
  });
  if (pages.length === 0) pages.push('Main');

  const totalTcCount = pages.reduce((s, p) => s + (p.cases||[]).length, 0);
  let prompt = 'Tu es un expert Robot Framework. Génère EXACTEMENT ces ' + (pages.length + 3) + ' fichiers POM.\n';
  prompt += 'Style: ' + styleGuide + ' | Library: ' + library + '\n';
  prompt += '⚠️ Le fichier tests/tests.robot DOIT contenir EXACTEMENT ' + totalTcCount + ' Test Cases — un par cas listé.\n\n';
  prompt += '⚠️ RÈGLES ABSOLUES :\n';
  prompt += '- Texte brut uniquement, JAMAIS de balises markdown.\n';
  prompt += '- Tous les noms de keywords en ANGLAIS.\n';
  prompt += '- COHÉRENCE STRICTE : chaque keyword appelé dans tests/tests.robot DOIT être défini AVEC LE MÊME NOM EXACT dans keywords.robot ou pages/*.robot.\n';
  prompt += '- Exemple correct :\n';
  prompt += '  keywords.robot  → "Open Login Page"\n';
  prompt += '  tests.robot     → "Given Open Login Page" (même nom après le préfixe BDD)\n';
  prompt += '- Exemple INTERDIT :\n';
  prompt += '  keywords.robot  → "Open Login Page"\n';
  prompt += '  tests.robot     → "Given User Opens The Login Page" (nom différent)\n';
  prompt += '- Génère TOUJOURS keywords.robot AVANT tests.robot pour garantir la cohérence.\n\n';
  prompt += 'DESCRIPTION:\n' + description + '\n\n';
  prompt += 'FORMAT OBLIGATOIRE — commence chaque fichier par ***** FILE: chemin | label | desc\n\n';

  // 1. variables.robot
  prompt += '***** FILE: resources/variables.robot | variables | Variables\n';
  prompt += '*** Settings ***\nDocumentation    Variables\n\n*** Variables ***\n${BASE_URL}    https://...\n${BROWSER}    chrome\n# Sélecteurs\n\n';

  // 2. page files
  pages.forEach(p => {
    const fname = p.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_') + '_page.robot';
    prompt += '***** FILE: resources/pages/' + fname + ' | page | ' + p + '\n';
    prompt += '*** Settings ***\nDocumentation    Page Object ' + p + '\nLibrary    ' + library + '\nResource    ../variables.robot\n\n*** Keywords ***\n# Actions ' + p + '\n\n';
  });

  // 3. keywords.robot
  prompt += '***** FILE: resources/keywords.robot | keywords | Keywords\n';
  prompt += '*** Settings ***\nDocumentation    Keywords métier\nLibrary    ' + library + '\nResource    variables.robot\n';
  pages.forEach(p => {
    const fname = p.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_') + '_page.robot';
    prompt += 'Resource    pages/' + fname + '\n';
  });
  prompt += '\n*** Keywords ***\n# ' + styleGuide + '\n\n';

  // 4. tests/tests.robot — MANDATORY LAST FILE
  prompt += '***** FILE: tests/tests.robot | tests | Tests\n';
  prompt += '*** Settings ***\nDocumentation    Tests\nLibrary    ' + library + '\nResource    ../resources/variables.robot\nResource    ../resources/keywords.robot\n\n*** Test Cases ***\n# Tests basés sur les cas décrits\n\n';

  prompt += 'RAPPEL: Génère les ' + (pages.length + 3) + ' fichiers ci-dessus avec leur contenu Robot Framework complet.\n';
  prompt += 'Le fichier tests/tests.robot EST OBLIGATOIRE — il contient les Test Cases.\n';

  return prompt;
}


// ── Render code message ────────────────────────────────────────────────────────

// ── Open code in a new window ──────────────────────────────────────────────────
function openCodeWindow(files) {
  // files = [{ filename, code }]
  const win = window.open('', '_blank');
  if (!win) { showToast('⚠️ Autorise les popups dans ton navigateur'); return; }

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
<html lang="fr">
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
  <h1>🤖 QA AGENT — RÉSULTAT</h1>
  <div class="actions">
    <button class="btn" onclick="copyActive()" title="Copier tous les cas de tests">📋 Copier</button>
    <button class="btn" onclick="downloadActive()">⬇️ Télécharger</button>
    <button class="btn" onclick="downloadAll()">⬇️ Tout télécharger</button>
    <button class="btn red" onclick="resetAll()">🗑️ Reset</button>
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
    navigator.clipboard.writeText(FILES[active].code).then(() => toast('📋 Copié !'));
  }

  function downloadActive() {
    download(FILES[active].filename, FILES[active].code);
  }

  function downloadAll() {
    FILES.forEach(f => download(f.filename, f.code));
    toast('⬇️ ' + FILES.length + ' fichiers téléchargés');
  }

  function download(filename, code) {
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(code);
    a.download = filename;
    a.click();
  }

  function resetAll() {
    if (confirm('Fermer cette fenêtre ?')) window.close();
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
  // Fetch variables.robot asynchronously and update the card
  (async () => {
    try {
      const vr = await fetch('https://robotstudioai.onrender.com/api/rf/read-file?path=resources/variables.robot');
      if (vr.ok) {
        const vd = await vr.json();
        const card = window._codeCards.find(c => c.cardId === cardId4);
        if (card && vd.content) {
          card.files.push({ filename: 'resources/variables.robot', code: vd.content });
          saveCodeCards();
        }
      }
    } catch(e) {}
  })();
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
    const browserVar2 = code.includes('\${BROWSER}') ? '\${BROWSER}' : 'chrome';
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
  window._codeCards.push({ type: 'multi', cardId: cardId5, title: title5, files: files.map(f => ({ ...f, code: f.code })) });
  try { localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards)); } catch(e) {}

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
    tree[folder].push({ name: parts[parts.length-1], idx: i, fullPath: f.filename });
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
          title="Renommer">✏️</button>
        <button data-raction="file-delete" data-ridx="${f.idx}" data-card="${cardId}"
          style="background:transparent;border:none;color:var(--red);cursor:pointer;font-size:10px;padding:1px 3px"
          title="Supprimer">🗑</button>
      </span>
    </div>`;
  };

  const folderHtml = (folder) => {
    const depth = folder.split('/').length;
    const indent = depth * 12;
    return `<div class="tree-folder-row" data-folder="${escHtml(folder)}" data-card="${cardId}"
      draggable="true"
      ondragstart="window._treeDrag={folder:'${escHtml(folder)}',cardId:'${cardId}'};event.currentTarget.style.opacity='.4'"
      ondragend="event.currentTarget.style.opacity='1'"
      ondragover="event.preventDefault();event.currentTarget.style.background='rgba(0,212,170,0.1)'"
      ondragleave="event.currentTarget.style.background=''"
      ondrop="treeDropToFolder(event,'${escHtml(folder)}','${cardId}');event.currentTarget.style.background=''"
      style="display:flex;align-items:center;gap:4px;padding:5px 8px 2px ${indent}px;font-size:10px;
             color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;
             border-radius:4px;transition:background .1s;user-select:none">
      <span>📁</span>
      <span style="flex:1">${escHtml(folder.split('/').pop())}</span>
      <span class="tree-folder-actions" style="display:flex;gap:2px;margin-left:auto">
        <button data-raction="folder-rename" data-folder="${escHtml(folder)}" data-card="${cardId}"
          style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:10px;padding:1px 3px"
          title="Renommer">✏️</button>
        <button data-raction="folder-delete" data-folder="${escHtml(folder)}" data-card="${cardId}"
          style="background:transparent;border:none;color:var(--red);cursor:pointer;font-size:10px;padding:1px 3px"
          title="Supprimer">🗑</button>
      </span>
    </div>`;
  };

  const addFileBtn = (folder) => `<button onclick="treeAddFile('${escHtml(folder)}','${cardId}')"
    style="display:flex;align-items:center;gap:4px;padding:2px 8px 2px ${folder?'28px':'16px'};
           background:transparent;border:none;color:rgba(0,212,170,0.5);cursor:pointer;font-size:10px;
           font-family:'IBM Plex Mono',monospace;width:100%;text-align:left"
    title="Nouveau fichier">+ nouveau fichier</button>`;

  const addFolderBtn = (parentFolder) => `<button onclick="treeAddFolder('${escHtml(parentFolder)}','${cardId}')"
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
    tree[folder].forEach(f => { html += fileItemHtml(f, 22); });
    html += addFileBtn(folder);
    html += addFolderBtn(folder);
  });

  return html;
}

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
      showConfirmDialog('⚠️ Fichier existant', 'Remplacer <b>' + escHtml(name) + '</b> ?', async () => {
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
    showToast('⬆ ' + count + ' fichier(s) importé(s)');
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
      showToast('✅ ' + name + ' ajouté à la suite');
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
  showInputDialog('📁 Nouveau dossier', 'Nom du dossier (ex: pages)', '', name => {
    if (!name?.trim()) return;
    const folderPath = parentFolder ? parentFolder + '/' + name.trim() : name.trim();
    const card = (window._codeCards||[]).find(c => c.cardId === cardId);
    if (!card) return;
    // Create a placeholder .gitkeep file to materialize the folder
    const keepFile = folderPath + '/.gitkeep';
    if (card.files.find(f => f.filename === keepFile)) { showToast('⚠️ Dossier déjà existant'); return; }
    card.files.push({ filename: keepFile, code: '# placeholder' });
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast('📁 Dossier créé : ' + folderPath);
  });
}

// ── Add file ──────────────────────────────────────────────────────────────────
function treeAddFile(folder, cardId) {
  showInputDialog('📄 Nouveau fichier', 'Nom du fichier (ex: new_page.robot)', '', name => {
    if (!name?.trim()) return;
  const fullPath = folder ? folder + '/' + name.trim() : name.trim();
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card) return;
    card.files.push({ filename: fullPath, code: '*** Settings ***\n\n*** Keywords ***\n\n' });
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast('📄 Fichier créé : ' + fullPath);
  });
}

// ── Rename file ───────────────────────────────────────────────────────────────
function treeRename(e, idx, cardId) {
  e.stopPropagation();
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card?.files?.[idx]) return;
  const oldPath = card.files[idx].filename;
  const oldName = oldPath.split('/').pop();
  showInputDialog('✏️ Renommer', 'Nouveau nom', oldName, newName => {
    if (!newName?.trim() || newName.trim() === oldName) return;
    const parts = oldPath.split('/');
    parts[parts.length-1] = newName.trim();
    card.files[idx].filename = parts.join('/');
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast('✏️ Renommé en ' + newName.trim());
  });
}

// ── Delete file ───────────────────────────────────────────────────────────────
function treeDelete(e, idx, cardId) {
  e.stopPropagation();
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card?.files?.[idx]) return;
  showConfirmDialog('🗑 Supprimer', 'Supprimer <b>' + escHtml(card.files[idx].filename) + '</b> ?', () => {
    card.files.splice(idx, 1);
    saveCodeCards();
    const el = document.getElementById(cardId);
    if (el) { el.remove(); renderResultCard(card.files, cardId); }
    showToast('🗑 Fichier supprimé');
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
      showToast('⚠️ Impossible de déplacer un dossier dans lui-même'); return;
    }
    const srcName = srcFolder.split('/').pop();
    const newBase = targetFolder ? targetFolder + '/' + srcName : srcName;
    card.files = card.files.map(f => ({
      ...f,
      filename: f.filename.startsWith(srcFolder + '/')
        ? newBase + f.filename.slice(srcFolder.length)
        : f.filename
    }));
    showToast('📁 Dossier déplacé vers ' + (targetFolder || 'racine'));
  } else if (drag.idx !== undefined) {
    // Moving a file into a folder
    const file = card.files[drag.idx];
    if (!file) return;
    const fname = file.filename.split('/').pop();
    file.filename = targetFolder ? targetFolder + '/' + fname : fname;
    showToast('📄 Fichier déplacé vers ' + (targetFolder || 'racine'));
  }

  saveCodeCards();
  const el = document.getElementById(cardId);
  if (el) { el.remove(); renderResultCard(card.files, cardId); }
}

// ── Save helper ───────────────────────────────────────────────────────────────

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


function saveCodeCards() {
  updateStatsBar();
  try { localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards||[])); } catch(e){}
}

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
    const safe = escHtml(f.code);
    const hl   = syntaxHL(safe);

    // Multi-file run selector
    const runSelector = isMulti ? `
      <select data-card="${cardId}" data-raction="runselect"
        style="background:var(--code);border:1px solid var(--border);border-radius:5px;color:var(--text);font-family:'IBM Plex Mono',monospace;font-size:11px;padding:5px 8px;outline:none;min-width:160px">
        <option value="all">▶ Tous les fichiers</option>
        ${files.map((f,i) => `<option value="${i}">▶ ${escHtml(f.filename.split('/').pop())}</option>`).join('')}
      </select>` : '';

    const editId = cardId + '-edit-' + active;

    div.draggable = true;
    const _dragTimestamp = Date.now();
    div.dataset.dragCode     = encodeURIComponent(files.map(f => f.code).join('\n\n'));
    div.dataset.dragFilename = files[0].filename.replace('.robot','') + '_' + _dragTimestamp + '.robot';
    div.dataset.dragName     = (files.length > 1 ? files.length + ' fichiers' : files[0].filename.replace('.robot','').replace(/_/g,' '));

    div.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', div.dataset.dragCode);
      e.dataTransfer.setData('application/x-rf-card', JSON.stringify({
        code:     div.dataset.dragCode,
        filename: div.dataset.dragFilename,
        name:     div.dataset.dragName,
      }));
      e.dataTransfer.effectAllowed = 'copy';
      div.style.opacity = '0.6';
      div.style.outline = '2px solid var(--teal)';
    });
    div.addEventListener('dragend', () => {
      div.style.opacity = '1';
      div.style.outline = '';
    });

    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body" style="width:100%;max-width:820px">
        <div class="msg-bubble" style="padding:0;overflow:hidden;min-width:340px;max-width:100%;width:100%;box-sizing:border-box;resize:horizontal;overflow:auto">

          <!-- Card header -->
          <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:var(--card);border-bottom:1px solid var(--border);flex-wrap:wrap">
            <span style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--teal);font-weight:600;cursor:grab" title="Glisser vers la Test Suite">
              ⠿ ✅ ${isMulti ? files.length + ' fichiers générés' : '📄 ' + escHtml(f.filename)}
            </span>
            ${(() => {
              const card = (window._codeCards||[]).find(c => c.cardId === cardId);
              const t = card?.title || window._lastGeneratedTitle || '';
              return t ? '<span style="background:rgba(0,212,170,0.12);border:1px solid var(--teal);color:var(--teal);font-family:\'IBM Plex Mono\',monospace;font-size:10px;padding:2px 9px;border-radius:10px;white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis" title="' + escHtml(t) + '">🏷️ ' + escHtml(t) + '</span>' : '';
            })()}
            <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
              ${runSelector}
              <button data-card="${cardId}" data-raction="toggleedit"
                style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);color:#60a5fa;padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Éditer le code">✏️ Éditer</button>
              <button data-card="${cardId}" data-raction="run"
                style="background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#07090f;
                       padding:6px 14px;border-radius:6px;font-size:11px;font-family:'IBM Plex Mono',monospace;
                       font-weight:700;cursor:pointer;white-space:nowrap">
                ▶️ Run
              </button>
              <button data-card="${cardId}" data-raction="merge-code"
                style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Sélectionner des blocs à fusionner">☑ Sélectionner</button>
              <button data-card="${cardId}" data-raction="copy"
                title="Copier le code" style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer">📋</button>
              <button data-card="${cardId}" data-raction="download"
                title="Télécharger ce fichier" style="background:rgba(245,158,11,0.08);border:1px solid var(--warn);color:var(--warn);padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Télécharger ce fichier">⬇️</button>
              ${isMulti ? `<button data-card="${cardId}" data-raction="downloadall"
                title="Télécharger tous les fichiers" style="background:rgba(59,130,246,0.08);border:1px solid #60a5fa;color:#60a5fa;padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Télécharger tous les fichiers">⬇️ Tout</button>` : ''}
              <button data-card="${cardId}" data-raction="reset"
                style="background:rgba(230,57,70,0.08);border:1px solid var(--red);color:var(--red);padding:4px 10px;border-radius:5px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer" title="Fermer">✕</button>
            </div>
          </div>

          <!-- Layout: tree sidebar + code area -->
          <div style="display:flex;min-height:360px">

            <!-- File tree (multi only) -->
            ${isMulti ? `<div style="width:200px;min-width:140px;flex-shrink:0;background:#060a10;border-right:1px solid var(--border);padding:10px 0;overflow-y:auto;resize:horizontal;overflow:auto"
  ondragover="event.preventDefault()"
  ondrop="treeDropToFolder(event,'','${cardId}')">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:0 8px 8px;border-bottom:1px solid var(--border);margin-bottom:6px">
                <span style="font-size:9px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px">ARBORESCENCE</span>
                <label title="Importer .robot .py .png .jpg"
                  style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);
                         padding:2px 8px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
                  ⬆ Import
                  <input type="file" multiple accept=".robot,.py,.png,.jpg,.jpeg"
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
                <input id="${editId}-search-input" placeholder="🔍 Rechercher..." type="text"
                  style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:5px;
                         color:var(--text);font-family:'IBM Plex Mono',monospace;font-size:12px;padding:4px 8px;outline:none"
                  oninput="searchInCode('${editId}', this.value)"
                  onkeydown="if(event.key==='Escape'){document.getElementById('${editId}-search').style.display='none';document.getElementById('${editId}-search-input').value='';searchInCode('${editId}','')}" />
                <span id="${editId}-search-count" style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;white-space:nowrap"></span>
                <button onclick="navigateSearch('${editId}',-1)" style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:14px" title="Précédent">▲</button>
                <button onclick="navigateSearch('${editId}',1)"  style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:14px" title="Suivant">▼</button>
                <button onclick="document.getElementById('${editId}-search').style.display='none';searchInCode('${editId}','')"
                  style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:14px">✕</button>
              </div>
              <!-- Code view (read) -->
              <div id="${editId}-view" style="flex:1;position:relative;overflow:hidden"
                onkeydown="if((event.ctrlKey||event.metaKey)&&event.key==='f'){event.preventDefault();const s=document.getElementById('${editId}-search');s.style.display='flex';document.getElementById('${editId}-search-input').focus()}"
                tabindex="0">
                <pre id="${editId}-pre" style="padding:14px;font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.75;color:#7dd3c8;overflow:auto;min-height:320px;height:420px;resize:vertical;white-space:pre;margin:0">${hl}</pre>
              </div>

              <!-- Code editor (hidden by default) -->
              <div id="${editId}-editor" style="display:none;flex:1;flex-direction:column">
                <textarea id="${editId}-ta"
                  style="flex:1;width:100%;min-height:320px;background:var(--code);border:none;color:#7dd3c8;
                         font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.75;
                         padding:14px;outline:none;resize:vertical;box-sizing:border-box;white-space:pre;overflow-x:auto"
                  spellcheck="false">${escHtml(f.code)}</textarea>
                <div style="display:flex;gap:8px;padding:10px 14px;background:var(--card);border-top:1px solid var(--border)">
                  <button data-card="${cardId}" data-raction="applyedit" data-editid="${editId}"
                    style="background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;padding:8px 18px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
                    ✅ Appliquer
                  </button>
                  <button data-card="${cardId}" data-raction="canceledit" data-editid="${editId}"
                    style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:8px 14px;border-radius:7px;font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
                    Annuler
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>`;

    // Event delegation
    div.onclick = e => {
      const btn = e.target.closest('[data-raction]');
      if (!btn) return;
      const action = btn.dataset.raction;
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
      } else if (action === 'merge-code') {
              openCodeMergeSelector(cardId, files);
      } else if (action === 'toggleedit') {
        const eid   = cardId + '-edit-' + activeTab;
        const view  = document.getElementById(eid + '-view');
        const editor= document.getElementById(eid + '-editor');
        if (!view || !editor) return;
        const isEditing = editor.style.display !== 'none';
        view.style.display   = isEditing ? 'block' : 'none';
        editor.style.display = isEditing ? 'none'  : 'block';
        btn.textContent = isEditing ? '✏️ Éditer' : '👁 Voir';
      } else if (action === 'applyedit') {
        const eid = btn.dataset.editid;
        const ta  = document.getElementById(eid + '-ta');
        if (!ta) return;
        // Update files array with new code
        files[activeTab].code = ta.value;
        // Persist in _codeCards
        window._codeCards = (window._codeCards||[]).map(c => {
          if (c.cardId !== cardId) return c;
          const newFiles = [...(c.files||[])];
          if (newFiles[activeTab]) newFiles[activeTab] = { ...newFiles[activeTab], code: ta.value };
          return { ...c, files: newFiles };
        });
        window._lastGeneratedCode = ta.value;
        try {
          localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards));
          localStorage.setItem('qa_last_code', ta.value);
        } catch(e) {}
        // Re-render card to update syntax highlight
        buildCard(activeTab);
        showToast('✅ Code mis à jour et sauvegardé');
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
          // Always send ALL files with FILE: delimiters so server writes them all to disk
          combined = filesToRun.map(f =>
            '***** FILE: ' + f.filename + ' | ' + (f.label || f.filename.split('/').pop().replace('.robot','')) + ' | ' + (f.desc || f.filename) + '\n' + f.code
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
          .then(() => showToast('📋 Copié !'));
      } else if (action === 'download') {
        dlFile(files[activeTab].filename, files[activeTab].code);
      } else if (action === 'downloadall') {
        files.forEach(f => dlFile(f.filename, f.code));
        showToast('⬇️ ' + files.length + ' fichiers téléchargés');
      } else if (action === 'reset') {
        const card = (window._codeCards||[]).find(c => c.cardId === cardId);
        const blockTitle = card?.title || (files[0]?.filename || 'ce bloc');
        showConfirmDialog('🗑 Supprimer le bloc', 'Supprimer <b>' + escHtml(blockTitle) + '</b> ?', () => {
          window._codeCards = (window._codeCards||[]).filter(c => c.cardId !== cardId);
          // Remove from suiteRegistry
          suiteRegistry = (suiteRegistry||[]).filter(t => t.cardId !== cardId);
          saveSuiteRegistry();
          // Remove from savedSuites testIds
          savedSuites.forEach(s => { s.testIds = (s.testIds||[]).filter(id => suiteRegistry.some(t => t.id === id)); });
          saveSuitesList();
          saveCodeCards();
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

function dlFile(filename, code) {
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(code);
  a.download = filename.split('/').pop();
  a.click();
}

// ── Syntax highlight ───────────────────────────────────────────────────────────
function syntaxHL(code) {
  return code
    .replace(/(\*{3}[^*]+\*{3})/g, '<span style="color:#e06c75;font-weight:700">$1</span>')
    .replace(/(#[^\n]*)/g, '<span style="color:#5c6370;font-style:italic">$1</span>')
    .replace(/(\$\{[^}]+\})/g, '<span style="color:#e5c07b">$1</span>')
    .replace(/(\[(?:Arguments|Return|Documentation|Tags|Setup|Teardown|Timeout)\])/g, '<span style="color:#c678dd">$1</span>');
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
  chatHistory = [];
  azureSession = null;
  try {
    ['qa_agent_history','qa_agent_azure','qa_agent_jira','qa_agent_pending'].forEach(k => localStorage.removeItem(k));
    pendingTestCases = null;
    _rfPaused = false;
    // Cancel all schedule timers
    Object.values(scheduleTimers).forEach(t => clearTimeout(t));
    scheduleTimers = {};
    jiraSession = null;
  } catch(e) {}
  document.getElementById('messages').innerHTML = '';
  showWelcome();
  showToast('Chat réinitialisé');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}


// ══════════════════════════════════════════════════════════════════════════════
// JIRA
// ══════════════════════════════════════════════════════════════════════════════

// Jira uses Basic Auth: base64(email:token)
// Issue key format: PROJ-42 (not just a number)

async function handleJiraConnect(url, token, apiKey, userText) {
  showTyping();
  try {
    const parsed = new URL(url.trim());
    const host   = parsed.hostname; // monorg.atlassian.net

    // Extract email from message
    const emailMatch = userText.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
    const email      = emailMatch ? emailMatch[1] : '';

    if (!email) {
      hideTyping();
      renderAgentMsg('⚠️ Précise ton email Jira dans le message.\nEx : `Connecte-toi sur Jira https://monorg.atlassian.net avec email@company.com et token XYZ`');
      return;
    }

    const b64 = btoa(`${email}:${token}`);
    const r   = await fetch(`https://${host}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${b64}`,
        'Accept': 'application/json',
      },
    });
    const data = await r.json();
    hideTyping();

    if (r.status === 401) { renderAgentMsg('❌ Token Jira invalide ou email incorrect.'); return; }
    if (!r.ok)            { renderAgentMsg(`❌ Erreur Jira : HTTP ${r.status}`); return; }

    jiraSession = { host, email, token, b64, displayName: data.displayName };
    LS.save();
    renderAgentMsg(`✅ Connecté à Jira !\n\n<span class="tag jira">🟦 ${host}</span> — Bonjour **${data.displayName}** !\n\nQuel numéro d'US veux-tu récupérer ? (ex: PROJ-42)`);

  } catch(err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur de connexion Jira : ${err.message}`);
  }
}

async function handleJiraFetch(id, shouldGenerate, apiKey) {
  showTyping();
  try {
    const { host, b64 } = jiraSession;

    // id can be "PROJ-42" or just "42" — if just a number, ask for full key
    const issueKey = /^\d+$/.test(id)
      ? (() => { hideTyping(); renderAgentMsg(`⚠️ Précise la clé complète de l'issue Jira (ex: **PROJ-${id}**)`); return null; })()
      : id.toUpperCase();

    if (!issueKey) return;

    const r  = await fetch(`https://robotstudioai.onrender.com/api/jira/issue/${issueKey}`);
    const data = await r.json();
    hideTyping();

    if (r.status === 404) { renderAgentMsg(`❌ Issue **${issueKey}** introuvable.`); return; }
    if (!r.ok)            { renderAgentMsg(`❌ Erreur Jira : ${data.error || r.status}`); return; }

    const f = {
      summary:          data.title,
      description:      data.description,
      customfield_10016:data.acceptance,
      status:           { name: data.state },
      issuetype:        { name: data.type },
      labels:           data.labels,
    };

    // Extract description text (already extracted by proxy)
    const extractAdf = (adf) => {
      if (!adf) return '';
      if (typeof adf === 'string') return adf;
      const texts = [];
      const walk = (node) => {
        if (node.type === 'text') texts.push(node.text);
        if (node.content) node.content.forEach(walk);
      };
      walk(adf);
      return texts.join(' ');
    };

    const issue = {
      id:          data.id,
      title:       data.title || f.summary,
      description: data.description || extractAdf(f.description),
      acceptance:  data.acceptance || extractAdf(f['customfield_10016'] || null),
      state:       data.state || f.status?.name || '',
      type:        data.type || f.issuetype?.name || 'Story',
      labels:      data.labels || f.labels || [],
      url:         data.url || `https://${host}/browse/${data.id}`,
    };

    // Issue type → icône + couleur
    function issueTypeTag(type) {
      const t = (type || '').toLowerCase();
      if (t.includes('bug')    || t.includes('défaut'))  return `<span style="background:rgba(230,57,70,0.15);color:#DC2626;border:1px solid rgba(230,57,70,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">🐛 Bug</span>`;
      if (t.includes('epic'))                            return `<span style="background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">⚡ Epic</span>`;
      if (t.includes('story') || t.includes('histoire')) return `<span style="background:rgba(0,212,170,0.15);color:var(--teal);border:1px solid rgba(0,212,170,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">📖 Story</span>`;
      if (t.includes('task')  || t.includes('tâche') || t.includes('tache')) return `<span style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">✅ Tâche</span>`;
      return `<span class="tag jira">${escHtml(type)}</span>`;
    }

    // Render card
    const cardHtml = `
      <div class="us-card">
        <div class="us-id">🟦 ${issue.id} · ${issueTypeTag(issue.type)} · <span class="tag warn">${issue.state}</span></div>
        <div class="us-title">${escHtml(issue.title)}</div>
        ${issue.description ? `<div class="us-section"><div class="us-section-label">DESCRIPTION</div><div class="us-section-content">${escHtml(issue.description)}</div></div>` : ''}
        ${issue.acceptance  ? `<div class="us-section"><div class="us-section-label">CRITÈRES D'ACCEPTANCE</div><div class="us-section-content us-acceptance">${escHtml(issue.acceptance)}</div></div>` : ''}
        ${issue.labels.length ? `<div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;margin-top:8px">Labels : ${issue.labels.map(l => `<span class="tag jira">${escHtml(l)}</span>`).join(' ')}</div>` : ''}
      </div>`;

    const issueCardId = 'issue-' + Date.now();
    const div = document.createElement('div');
    div.className = 'msg agent';
    div.id = issueCardId;
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="msg-bubble">
          J'ai récupéré l'US <strong>${issue.id}</strong> :${cardHtml}
          <div style="margin-top:12px;font-size:13px;color:#8ab4c4">
            Veux-tu que je génère des cas de tests à partir de cette US ?
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button data-issue-card="${issueCardId}" data-action="yes"
              style="background:rgba(0,212,170,0.12);border:1px solid var(--teal);color:var(--teal);padding:8px 20px;border-radius:7px;font-size:13px;font-family:'Syne',sans-serif;font-weight:600;cursor:pointer">
              ✅ Oui, générer les cas de tests
            </button>
            <button data-issue-card="${issueCardId}" data-action="no"
              style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:8px 16px;border-radius:7px;font-size:13px;font-family:'Syne',sans-serif;cursor:pointer">
              ✕ Non merci
            </button>
          </div>
        </div>
      </div>`;
    document.getElementById('messages').appendChild(div);

    // Store issue for button click
    window._pendingIssues = window._pendingIssues || {};
    window._pendingIssues[issueCardId] = { issue, apiKey };

    // Event handler for Yes/No buttons
    div.addEventListener('click', async e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const stored = window._pendingIssues[issueCardId];

      // Remove buttons
      div.querySelectorAll('[data-action]').forEach(b => b.remove());
      div.querySelector('[style*="Veux-tu"]')?.remove();

      if (action === 'yes' && stored) {
        await generateTestCasesFromIssue(stored.issue, stored.apiKey);
      }
      // If "no" — do nothing, just remove the buttons
    });

    chatHistory.push({ role: 'assistant', content: `[Jira ${issue.id}: ${issue.title}]` });
    LS.save();
    scrollToBottom();

  } catch(err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur Jira : ${err.message}`);
  }
}

async function generateFromJiraIssue(issue, apiKey) {
  await generateTestCasesFromIssue(issue, apiKey);
}

// Generate test cases list (step 1) from a Jira/Azure issue
async function generateTestCasesFromIssue(issue, apiKey) {
  showTyping();

  const nb = 3;

  // Build rich context from issue fields
  const contextParts = [];
  if (issue.title)       contextParts.push(`Titre : ${issue.title}`);
  if (issue.description) contextParts.push(`Description :\n${issue.description}`);
  if (issue.acceptance)  contextParts.push(`Critères d'acceptance :\n${issue.acceptance}`);
  if (issue.labels?.length) contextParts.push(`Labels : ${issue.labels.join(', ')}`);
  const context = contextParts.join('\n\n');

  // Generate test cases in current UI language, but RF code stays in English
  const langInstr = {
    fr: 'Génère les cas de tests en FRANÇAIS.',
    en: 'Generate the test cases in ENGLISH.',
    es: 'Genera los casos de prueba en ESPAÑOL.',
    pt: 'Gera os casos de teste em PORTUGUÊS.',
  }[currentLang] || 'Génère les cas de tests en FRANÇAIS.';

  const prompt = `Tu es un expert QA. En lisant attentivement le contenu de cette user story / tâche, génère exactement ${nb} cas de tests FONCTIONNELS concrets en langage naturel.

${langInstr}

=== CONTENU DE LA TÂCHE ===
${context}
=== FIN DU CONTENU ===

RÈGLES STRICTES :
- Lis et analyse le contenu réel ci-dessus
- Génère des cas qui testent les FONCTIONNALITÉS décrites dans cette tâche spécifique
- Chaque cas doit être directement lié au contenu de la tâche
- NE génère PAS de tests génériques sur Robot Framework ou l'IA

Format de réponse OBLIGATOIRE — UNIQUEMENT ce JSON, rien d'autre, sans backticks :
{
  "cases": [
    { "id": 1, "testId": "TC_001", "name": "Nom concret du cas", "description": "Scénario détaillé basé sur la tâche", "expected": "Résultat attendu précis" },
    { "id": 2, "testId": "TC_002", "name": "...", "description": "...", "expected": "..." },
    { "id": 3, "testId": "TC_003", "name": "...", "description": "...", "expected": "..." }
  ]
}`;

  try {
    const raw    = await callClaudeRaw(apiKey, prompt);
    const clean  = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
    const parsed = JSON.parse(clean);
    hideTyping();

    const blockId = 'block-' + Date.now();
    const block = {
      blockId,
      title:    issue.title || 'Cas de tests',
      pageLabel: issue.url ? new URL(issue.url).pathname.replace(/\//g,' ').trim() || 'Page principale' : 'Page',
      cases:    parsed.cases,
    };
    pendingTestCases = { userText: issue.title, url: issue.url||null, username:null, password:null, cases: parsed.cases, sourceIssue: issue };
    pendingBlocks.push(block);
    LS.save();

    renderTestCasesCard(parsed.cases, issue.url, true, blockId);

  } catch(err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur génération des cas : ${err.message}`);
  }
}

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

  // Load all saved data
  LS.load();

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

// ── API key helpers ───────────────────────────────────────────────────────────
function clearApiKey() {
  const el = document.getElementById('apiKey');
  el.value = '';
  el.type = 'password';
  document.getElementById('keyToggle').textContent = '👁';
  updateKeyStatus('');
  try { localStorage.removeItem('qa_agent_key'); } catch(e) {}
  el.focus();
  showToast('Clé API effacée');
}

function toggleKeyVisibility() {
  const el  = document.getElementById('apiKey');
  const btn = document.getElementById('keyToggle');
  if (el.type === 'password') {
    el.type = 'text';
    btn.textContent = '🙈';
  } else {
    el.type = 'password';
    btn.textContent = '👁';
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// GRAPHICAL CONNECTION UI
// ══════════════════════════════════════════════════════════════════════════════

// ── Toggle connection card open/close ─────────────────────────────────────────
function toggleConnCard(platform) {
  const body    = document.getElementById(platform + 'Body');
  const chevron = document.getElementById(platform + 'Chevron');
  body.classList.toggle('open');
  chevron.classList.toggle('open');
  // Save open state
  try { localStorage.setItem('qa_conn_' + platform + '_open', body.classList.contains('open')); } catch(e) {}
}

// ── Restore card open states ──────────────────────────────────────────────────
function restoreConnCards() {
  ['azure', 'jira'].forEach(p => {
    const isOpen = localStorage.getItem('qa_conn_' + p + '_open') === 'true';
    if (isOpen) {
      document.getElementById(p + 'Body')?.classList.add('open');
      document.getElementById(p + 'Chevron')?.classList.add('open');
    }
    // Restore saved field values
    const url   = localStorage.getItem('qa_' + p + '_url');
    const token = localStorage.getItem('qa_' + p + '_token');
    const email = localStorage.getItem('qa_jira_email');
    if (p === 'azure') {
      if (url)   document.getElementById('azureUrlInput').value   = url;
      if (token) document.getElementById('azureTokenInput').value = token;
      if (azureSession) updateConnBadge('azure', true, azureSession.org + '/' + azureSession.project);
    }
    if (p === 'jira') {
      if (url)   document.getElementById('jiraUrlInput').value   = url;
      if (token) document.getElementById('jiraTokenInput').value = token;
      if (email) document.getElementById('jiraEmailInput').value  = email;
      if (jiraSession) updateConnBadge('jira', true, jiraSession.project);
    }
  });
}

// ── Update badge ──────────────────────────────────────────────────────────────
function updateConnBadge(platform, connected, label) {
  const badge = document.getElementById(platform + 'Badge');
  const card  = document.getElementById(platform + 'Card');
  const btn   = document.getElementById(platform + 'ConnectLabel');
  if (!badge) return;
  if (connected) {
    badge.textContent = '✓ ' + (label || 'connecté');
    badge.className   = 'conn-badge ' + (platform === 'jira' ? 'ok-blue' : 'ok');
    card.className    = 'conn-card ' + (platform === 'jira' ? 'connected-jira' : 'connected');
    if (btn) btn.textContent = '🔄 Reconnecter';
  } else {
    badge.textContent = 'non connecté';
    badge.className   = 'conn-badge';
    card.className    = 'conn-card';
    if (btn) btn.textContent = '🔗 Connecter';
  }
}

function showConnError(platform, msg) {
  const el = document.getElementById(platform + 'Error');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}
function hideConnError(platform) {
  document.getElementById(platform + 'Error')?.classList.remove('show');
}

// ── Toggle field visibility ───────────────────────────────────────────────────
function toggleFieldVisibility(fieldId, btn) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  if (el.type === 'password') { el.type = 'text'; btn.textContent = '🙈'; }
  else                        { el.type = 'password'; btn.textContent = '👁'; }
}

// ── Azure UI ──────────────────────────────────────────────────────────────────
async function uiConnectAzure() {
  const url   = document.getElementById('azureUrlInput').value.trim();
  const token = document.getElementById('azureTokenInput').value.trim();
  hideConnError('azure');

  if (!url || !token) {
    showConnError('azure', '⚠️ URL et token requis');
    return;
  }

  const btn = document.getElementById('azureConnectLabel');
  btn.textContent = '⏳ Connexion...';

  try {
    const r    = await fetch('https://robotstudioai.onrender.com/api/azure/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ azureUrl: url, token }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `Erreur HTTP ${r.status}`);

    azureSession = { org: data.org, project: data.project, token };
    try {
      localStorage.setItem('qa_azure_url',   url);
      localStorage.setItem('qa_azure_token', token);
      LS.save();
    } catch(e) {}

    updateConnBadge('azure', true, data.org + '/' + data.project);
    renderAgentMsg(`✅ Connecté à Azure DevOps — <span class="tag azure">📁 ${data.org} / ${data.project}</span>\n\nSaisis un numéro d'US et clique **Récupérer**.`);

  } catch(err) {
    btn.textContent = '🔗 Connecter';
    const msg = err.message.includes('fetch') ? '❌ Serveur proxy non démarré — lance node server.js' : '❌ ' + err.message;
    showConnError('azure', msg);
  }
}

async function uiFetchAzure() {
  const id = document.getElementById('azureUsInput').value.trim();
  hideConnError('azure');
  if (!id) { showConnError('azure', '⚠️ Saisis un numéro d\'US'); return; }
  if (!azureSession) { showConnError('azure', '⚠️ Connecte-toi d\'abord'); return; }

  const btn = document.querySelector('#azureCard .mini-btn');
  if (btn) btn.textContent = '⏳';

  try {
    const r    = await fetch(`https://robotstudioai.onrender.com//api/azure/workitem/${id}`);
    const data = await r.json();
    if (!r.ok) { showConnError('azure', '❌ ' + (data.error || `Erreur HTTP ${r.status}`)); return; }
    const apiKey = document.getElementById('apiKey').value.trim();
    await handleFetchAndGenerate(id, true, apiKey, '', data);  // true = génère les cas
  } catch(err) {
    showConnError('azure', err.message.includes('fetch') ? '❌ Serveur proxy non démarré' : '❌ ' + err.message);
  } finally {
    if (btn) btn.textContent = 'Récupérer';
  }
}

function uiDisconnectAzure() {
  azureSession = null;
  try {
    localStorage.removeItem('qa_azure_url');
    localStorage.removeItem('qa_azure_token');
    LS.save();
  } catch(e) {}
  document.getElementById('azureUrlInput').value   = '';
  document.getElementById('azureTokenInput').value = '';
  document.getElementById('azureUsInput').value    = '';
  updateConnBadge('azure', false);
  hideConnError('azure');
  showToast('Azure DevOps déconnecté');
}

// ── Jira UI ───────────────────────────────────────────────────────────────────
async function uiConnectJira() {
  const url   = document.getElementById('jiraUrlInput').value.trim();
  const email = document.getElementById('jiraEmailInput').value.trim();
  const token = document.getElementById('jiraTokenInput').value.trim();
  hideConnError('jira');

  if (!url || !email || !token) {
    showConnError('jira', '⚠️ URL, email et token requis');
    return;
  }

  const btn = document.getElementById('jiraConnectLabel');
  btn.textContent = '⏳ Connexion...';

  try {
    const r    = await fetch('https://robotstudioai.onrender.com/api/jira/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jiraUrl: url, email, token }),
    });
    const data = await r.json();

    if (!r.ok) throw new Error(data.error || `Erreur HTTP ${r.status}`);

    const host = new URL(url).hostname;
    jiraSession = { host, email, token, b64: btoa(`${email}:${token}`), displayName: data.displayName };
    try {
      localStorage.setItem('qa_jira_url',   url);
      localStorage.setItem('qa_jira_token', token);
      localStorage.setItem('qa_jira_email', email);
      LS.save();
    } catch(e) {}

    updateConnBadge('jira', true, host);
    renderAgentMsg(`✅ Connecté à Jira — <span class="tag jira">🟦 ${host}</span>\n\nBonjour **${data.displayName}** ! Saisis un numéro d'issue et clique **Récupérer**.`);

  } catch(err) {
    btn.textContent = '🔗 Connecter';
    const msg = err.message.includes('fetch') ? '❌ Serveur proxy non démarré — lance node server.js' : '❌ ' + err.message;
    showConnError('jira', msg);
  }
}

async function uiFetchJira() {
  const id = document.getElementById('jiraIssueInput').value.trim();
  hideConnError('jira');
  if (!id) { showConnError('jira', '⚠️ Saisis un numéro d\'issue (ex: PROJ-42)'); return; }
  if (!jiraSession) { showConnError('jira', '⚠️ Connecte-toi d\'abord'); return; }

  const btn = document.querySelector('#jiraCard .mini-btn');
  if (btn) btn.textContent = '⏳';

  await handleJiraFetch(id, false, document.getElementById('apiKey').value.trim());

  if (btn) btn.textContent = 'Récupérer';
}

function uiDisconnectJira() {
  jiraSession = null;
  try {
    localStorage.removeItem('qa_jira_url');
    localStorage.removeItem('qa_jira_token');
    localStorage.removeItem('qa_jira_email');
    LS.save();
  } catch(e) {}
  document.getElementById('jiraUrlInput').value   = '';
  document.getElementById('jiraTokenInput').value = '';
  document.getElementById('jiraEmailInput').value = '';
  document.getElementById('jiraIssueInput').value = '';
  updateConnBadge('jira', false);
  hideConnError('jira');
  showToast('Jira déconnecté');
}

// ── Restore on load ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  restoreConnCards();
  // Restore connection badges if sessions exist
  if (azureSession) updateConnBadge('azure', true, azureSession.org + '/' + azureSession.project);
  if (jiraSession)  updateConnBadge('jira',  true, jiraSession.host);
});

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

// ══════════════════════════════════════════════════════════════════════════════
// RUN TESTS + REPORT
// ══════════════════════════════════════════════════════════════════════════════

let _lastGeneratedCode = null;
let _lastGeneratedFile = 'test_generated';

// Run button injected directly in renderResultCard

function addRunButton(code, filename) {
  const messages = document.getElementById('messages');
  const lastMsg  = messages.lastElementChild;
  if (!lastMsg) return;
  const bubble = lastMsg.querySelector('.msg-bubble');
  if (!bubble || bubble.querySelector('.run-tests-btn')) return;

  const runBar = document.createElement('div');
  runBar.style.cssText = 'margin-top:12px;display:flex;gap:8px;flex-wrap:wrap';
  runBar.innerHTML = `
    <button class="run-tests-btn"
      style="background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#07090f;padding:10px 20px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.5px"
      onclick="runTests(${JSON.stringify(code).replace(/"/g,'&quot;')}, '${filename}')">
      ▶️ Lancer les tests
    </button>`;
  bubble.appendChild(runBar);
}


// ── runTests — called from old-style onclick buttons ─────────────────────────
async function runTests(btnOrCode, filename) {
  let code, fname;
  if (typeof btnOrCode === 'string') {
    code  = btnOrCode;
    fname = filename || 'test_generated.robot';
  } else {
    // btn element
    code  = decodeURIComponent(btnOrCode?.dataset?.code || '');
    fname = decodeURIComponent(btnOrCode?.dataset?.filename || 'test_generated.robot');
  }
  if (code) await runTestsFromCard(code, fname);
}

async function runTestsFromCard(code, filename, suiteCtx) {
  const apiKey = document.getElementById('apiKey').value.trim();
  const isSuiteRun = suiteCtx?.isSuite;

  // Store immediately so Debug/Replay can use during run
  window._lastGeneratedCode = code;
  window._lastGeneratedFile = (filename || 'test_generated').replace('.robot', '');
  window._lastRunType = detectRunType(code);
  // Track which card is being run for variables.robot snapshot
  // Match by cardId passed in filename (result-TIMESTAMP)
  const cardIdFromFile = (filename||'').match(/result-\d+/);
  if (cardIdFromFile) {
    window._lastCardId = cardIdFromFile[0];
  } else {
    const runningCard = (window._codeCards||[]).find(c => c.files?.some(f => f.code === code));
    if (runningCard) window._lastCardId = runningCard.cardId;
  }
  // Persist for page refresh
  try {
    localStorage.setItem('qa_last_code',    code);
    localStorage.setItem('qa_last_file',    window._lastGeneratedFile);
    localStorage.setItem('qa_last_runtype', window._lastRunType);
    localStorage.setItem('qa_last_filename', filename || 'test_generated.robot');
  } catch(e) {}

  // Detect run type from library
  function detectRunType(code) {
    if (!code) return 'web';
    if (code.includes('AppiumLibrary'))    return 'mobile';
    if (code.includes('RequestsLibrary')) return 'api';
    if (code.includes('DatabaseLibrary')) return 'database';
    return 'web';
  }
  const runType  = detectRunType(code);
  const runTypeLabels = {
    mobile:   '📱 Run Mobile',
    api:      '🔌 Run API',
    database: '🗄️ Run Database',
    web:      '🔵 Run Web',
  };
  const runTypeBadge = runTypeLabels[runType] || '🔵 Run Web';
  const runLabel = isSuiteRun ? '🧪 Suite : **' + suiteCtx.suiteName + '**' : runTypeBadge;
  const runMsgId  = 'runMsg-' + Date.now();
  const runMsgDiv = document.createElement('div');
  runMsgDiv.className = 'msg agent';
  runMsgDiv.id = runMsgId;
  const runLabel2 = isSuiteRun
    ? '🧪 Suite : <strong>' + escHtml(suiteCtx.suiteName||'') + '</strong> — ' + (suiteCtx.tests||[]).length + ' test(s)'
    : runTypeBadge + ' Test run';
  // Only show "en cours" message for non-suite runs
  if (!isSuiteRun) {
    runMsgDiv.innerHTML =
      '<div class="msg-avatar">🤖</div>' +
      '<div class="msg-body"><div class="msg-bubble" style="padding:10px 14px">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<span id="' + runMsgId + '-label" style="font-size:13px;font-weight:600">⏳ Test en cours — ' + runLabel2 + '</span>' +
      '<button onclick="stopTestRun()" style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);color:var(--red);padding:3px 10px;border-radius:5px;font-size:11px;font-family:monospace;cursor:pointer">⏹ Stop</button>' +
      '</div>' +
      '</div></div>';
    localStorage.setItem('qa_active_run', JSON.stringify({ runMsgId, label: runLabel2 }));
    document.getElementById('messages').appendChild(runMsgDiv);
    scrollToBottom();
  }
  // For suite runs, don't append runMsgDiv (progress handled by suiteProgressDiv)

  window._currentRunMsgId = runMsgId;

  // Store ref to update status when done
  window._currentRunMsg = runMsgDiv;

  try {
    const headless = document.getElementById('optHeadless')?.value === 'headless';
    const r    = await fetch('http://localhost:3001/api/rf/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, filename: filename?.replace('.robot','') || 'test', headless }),
    });
    const data = await r.json();
    hideTyping();

    if (!r.ok) {
      renderAgentMsg(`❌ Erreur lors du lancement :\n\n${data.error}\n\n${data.details || ''}`);
      return;
    }

    // Show summary in chat — skip for suite blocs (consolidated report shown at end)
    if (!suiteCtx?.isSuite) {
      const icon    = data.status === 'PASS' ? '✅' : '❌';
      const rate    = data.total > 0 ? Math.round(data.passed / data.total * 100) : 0;
      const summary = `${icon} **${data.status}** — ${data.passed}/${data.total} tests réussis (${rate}%) en ${fmtDuration(data.duration)}`;
      renderAgentMsg(summary + '\n\nLe rapport complet est disponible ci-dessous 👇');
    }

    // After run: save variables.robot snapshot to current card for suite isolation
    if (!suiteCtx) {
      (async () => {
        try {
          const vr = await fetch('https://robotstudioai.onrender.com/api/rf/read-file?path=resources/variables.robot');
          if (vr.ok) {
            const vd = await vr.json();
            if (vd.content && window._lastCardId) {
              const card = (window._codeCards||[]).find(c => c.cardId === window._lastCardId);
              if (card) {
                const existing = card.files.find(f => f.filename.includes('variables.robot'));
                if (existing) existing.code = vd.content;
                else card.files.push({ filename: 'resources/variables.robot', code: vd.content });
                saveCodeCards();
                console.log('[run complete] saved variables.robot to card', window._lastCardId);
              }
            }
          }
        } catch(e) {}
      })();
    }

    // Open full report — skip individual cards for suite blocs
    if (!suiteCtx?.isSuite) {
      openTestReport(data, suiteCtx);
    } else {
      // Accumulate for consolidated report
      window._suiteBloc_reports = window._suiteBloc_reports || [];
      window._suiteBloc_reports.push(JSON.parse(JSON.stringify(data)));
      // Check if all blocs are done
      if (window._suiteTotal && window._suiteBloc_reports.length >= window._suiteTotal) {
        renderConsolidatedSuiteReport_inline();
      }
    }

    chatHistory.push({ role: 'assistant', content: `[Test run: ${data.status} ${data.passed}/${data.total}]` });
    LS.save();

  } catch(err) {
    hideTyping();
    if (err.message.includes('fetch') || err.message.includes('Failed')) {
      renderAgentMsg('❌ Serveur proxy non démarré.\n\nLance **`node server.js`** dans ton terminal puis réessaie.');
    } else {
      renderAgentMsg(`❌ Erreur : ${err.message}`);
    }
  }
}

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
    try { localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards)); } catch(e) {}
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
            <div style="font-size:14px;font-weight:700;color:#e8f0f8">${esc(t.name)}</div>
            <div style="font-size:11px;color:#94afc8;font-family:monospace;margin-top:2px">${iconEn} · ${fmtD(t.duration)}</div>
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">${tags}</div>
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
  },
  es: {
    flag: '🇪🇸', name: 'ES',
    poweredBy:        'impulsado por Claude',
    clearChat:        '✕ reset',
    generation:       '⚡ GENERACIÓN',
    connections:      '🔗 CONEXIONES',
    options:          '⚙️ OPCIONES',
    motto:            '💡 La IA no reemplaza al QA — elimina las partes tediosas para que te centres en lo que importa.',
    genTestCases:     '📋 Generar casos de prueba',
    genTestCasesDesc: 'Descripción libre → lista editable',
    genRFCode:        '⚡ Generar código RF',
    genRFCodeDesc:    'Casos → archivo .robot',
    styleBDD:         '📝 Estilo BDD',
    styleBDDDesc:     'Given / When / Then',
    azureTitle:       'Azure DevOps',
    jiraTitle:        'Jira',
    notConnected:     'no conectado',
    urlLabel:         'URL del proyecto',
    tokenLabel:       'Token (PAT)',
    usNumberLabel:    'Número de US',
    jiraUrlLabel:     'URL Jira',
    emailLabel:       'Email',
    apiTokenLabel:    'Token API',
    taskNumberLabel:  'Número de tarea',
    fetchBtn:         'Buscar',
    connectBtn:       '🔗 Conectar',
    libLabel:         'LIB',
    styleLabel:       'ESTILO',
    modeLabel:        'MODO',
    browserLabel:     'BROWSER',
    withBrowser:      '🖥️ Con navegador',
    withoutBrowser:   '🔇 Sin navegador',
    inputHint:        '↵ Enviar · ⇧↵ Nueva línea',
    submitBtn:        'ENVIAR',
    welcomeTitle:     '👋 ¡Hola! Soy tu **QA Agent** especializado en Robot Framework.',
    runTests:         '▶️ Ejecutar pruebas',
    editReport:       '✏️ Editar',
    history:          '📜 Historial',
    download:         '⬇️ Descargar',
  },
  pt: {
    flag: '🇵🇹', name: 'PT',
    poweredBy:        'desenvolvido com Claude',
    clearChat:        '✕ reset',
    generation:       '⚡ GERAÇÃO',
    connections:      '🔗 CONEXÕES',
    options:          '⚙️ OPÇÕES',
    motto:            '💡 A IA não substitui o QA — elimina as partes tediosas para que se concentre no que importa.',
    genTestCases:     '📋 Gerar casos de teste',
    genTestCasesDesc: 'Descrição livre → lista editável',
    genRFCode:        '⚡ Gerar código RF',
    genRFCodeDesc:    'Casos → arquivo .robot',
    styleBDD:         '📝 Estilo BDD',
    styleBDDDesc:     'Given / When / Then',
    azureTitle:       'Azure DevOps',
    jiraTitle:        'Jira',
    notConnected:     'não conectado',
    urlLabel:         'URL do projeto',
    tokenLabel:       'Token (PAT)',
    usNumberLabel:    'Número da US',
    jiraUrlLabel:     'URL Jira',
    emailLabel:       'Email',
    apiTokenLabel:    'Token API',
    taskNumberLabel:  'Número da tarefa',
    fetchBtn:         'Buscar',
    connectBtn:       '🔗 Conectar',
    libLabel:         'LIB',
    styleLabel:       'ESTILO',
    modeLabel:        'MODO',
    browserLabel:     'BROWSER',
    withBrowser:      '🖥️ Com navegador',
    withoutBrowser:   '🔇 Sem navegador',
    inputHint:        '↵ Enviar · ⇧↵ Nova linha',
    submitBtn:        'ENVIAR',
    welcomeTitle:     '👋 Olá! Sou o seu **QA Agent** especializado em Robot Framework.',
    runTests:         '▶️ Executar testes',
    editReport:       '✏️ Editar',
    history:          '📜 Histórico',
    download:         '⬇️ Baixar',
  },
};

let currentLang = 'fr';

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['fr'][key] || key;
}

function setLang(lang) {
  currentLang = lang;
  const tr = TRANSLATIONS[lang];
  try { localStorage.setItem('qa_agent_lang', lang); } catch(e) {}

  // Update flag + name in button
  document.getElementById('langFlag').textContent = tr.flag;
  document.getElementById('langName').textContent  = tr.name;
  document.getElementById('langMenu').style.display = 'none';
  document.documentElement.lang = lang;

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else if (el.tagName === 'OPTION') {
      // Preserve value attribute, only update text
      el.textContent = val;
    } else if (el.tagName === 'BUTTON') {
      // Preserve onclick and other attrs — just update text node
      // val may contain emoji prefix like "📋 ..." — set directly
      el.textContent = val;
    } else if (el.tagName === 'LABEL') {
      el.textContent = val;
    } else {
      // For spans, divs — set textContent directly
      el.textContent = val;
    }
  });

  // Update document title hint
  showToast(tr.flag + ' ' + (lang === 'fr' ? 'Français' : lang === 'en' ? 'English' : lang === 'es' ? 'Español' : 'Português'));
}

function toggleLangMenu() {
  const menu = document.getElementById('langMenu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Close lang menu when clicking outside
document.addEventListener('click', e => {
  if (!document.getElementById('langSelectorWrap')?.contains(e.target)) {
    const menu = document.getElementById('langMenu');
    if (menu) menu.style.display = 'none';
  }
});

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
          const resp = await fetch('https://robotstudioai.onrender.com/api/rf/status');
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
        style="background:transparent;border:1px solid rgba(230,57,70,0.3);color:var(--red);padding:4px 8px;border-radius:5px;font-size:10px;cursor:pointer" title="Fermer">✕</button>
    </div>`).join('') || '<div style="padding:16px;text-align:center;color:var(--gray);font-size:12px;font-style:italic">Aucun scheduling configuré</div>';

  const modal = document.createElement('div');
  modal.id = 'schedulerModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `<style>#schedDatetime::-webkit-calendar-picker-indicator{display:none!important}</style>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:580px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column">

      <!-- Header -->
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--card)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">⏰ Scheduler de tests</span>
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
  renderSuiteTestList();
  renderSavedSuites();
  // Restart active schedules
  suiteSchedules.filter(s => s.active).forEach(startScheduleTimer);
});


// ── Pause test run for debug ──────────────────────────────────────────────────
// RF runs in a terminal process — pause injects a breakpoint file
let _rfPaused = false;

function pauseTestRun(btn) {
  _rfPaused = true;
  btn.textContent = '▶️ Reprendre';
  btn.style.background = 'rgba(34,197,94,0.12)';
  btn.style.borderColor = 'rgba(34,197,94,0.35)';
  btn.style.color = 'var(--green)';
  btn.onclick = () => resumeTestRun(btn);

  // Ask server to create a pause flag file
  fetch('https://robotstudioai.onrender.com/api/rf/pause', { method: 'POST' }).catch(() => {});

  const msg = btn.closest('.msg-bubble');
  const info = document.createElement('div');
  info.id = 'pauseInfo';
  info.style.cssText = 'margin-top:10px;padding:10px 12px;background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:7px;font-size:12px;font-family:IBM Plex Mono,monospace;color:var(--warn);line-height:1.6';
  info.innerHTML = '⏸ <strong>Mode debug</strong> — Le test courant se terminera avant de s\'arrêter.<br>' +
    'Inspecte Chrome DevTools (F12), regarde les logs dans le terminal.<br>' +
    'Clique <strong>▶️ Reprendre</strong> pour continuer.';
  msg.appendChild(info);
  showToast('⏸ Pause debug activée');
}

function resumeTestRun(btn) {
  _rfPaused = false;
  btn.textContent = '⏸ Pause';
  btn.style.background = 'rgba(245,158,11,0.12)';
  btn.style.borderColor = 'rgba(245,158,11,0.35)';
  btn.style.color = 'var(--warn)';
  btn.onclick = () => pauseTestRun(btn);
  document.getElementById('pauseInfo')?.remove();
  fetch('https://robotstudioai.onrender.com/api/rf/resume', { method: 'POST' }).catch(() => {});
  showToast('▶️ Reprise');
}

function stopTestRun() {
  window._suiteStopped = true; // Stop suite loop
  fetch('https://robotstudioai.onrender.com/api/rf/stop', { method: 'POST' })
    .then(r => r.json())
    .then(d => {
      if (d.stopped) showToast('⏹ Run arrêté');
      else showToast('⚠️ Aucun run actif');
    })
    .catch(() => showToast('⚠️ Erreur arrêt — Ctrl+C dans le terminal'));
  hideTyping();
  window._currentRunMsg = null;
}

// ── Suite Panel ───────────────────────────────────────────────────────────────
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
  renderSuiteTestList();
  renderSavedSuites();
  try {
    const saved = localStorage.getItem('qa_suite_title');
    const input = document.getElementById('suiteTitleInput');
    if (saved && input) input.value = saved;
  } catch(e) {}
  setupSuiteDropZone();
}

function setupSuiteDropZone() {}

// ── Render available code cards as a list to add to suite ────────────────────
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
  const mainFile = card.files?.find(f => f.filename.includes('tests.robot')) || card.files?.[0];
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
      .filter(f => f.code?.trim() && !f.filename.includes('tests.robot'))
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

function saveSuitesList() {
  try { localStorage.setItem('qa_named_suites', JSON.stringify(savedSuites)); } catch(e) {}
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
            <button onclick="event.stopPropagation();suiteMoveUp(${si},${ti})"
              style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.2);color:var(--teal);
                     cursor:pointer;font-size:9px;padding:1px 5px;border-radius:3px;line-height:1"
              title="Monter">▲</button>
            <button onclick="event.stopPropagation();suiteMoveDown(${si},${ti})"
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
          <button onclick="runSuiteGroup(${si})"
            style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:#22c55e;
                   padding:4px 10px;border-radius:5px;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer">▶️</button>
          <select onchange="setSuiteHeadless('${s.id}',this.value)" onclick="event.stopPropagation()"
            style="font-size:10px;background:var(--card);border:1px solid var(--border);color:var(--gray);border-radius:4px;padding:2px 4px;cursor:pointer"
            title="Mode navigateur pour cette suite">
            <option value="visible" ${(s.headless||'visible')==='visible'?'selected':''}>🖥️</option>
            <option value="headless" ${s.headless==='headless'?'selected':''}>🔇 Headless</option>
          </select>
          <button onclick="deleteSuiteGroup(${si})"
            style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:12px;padding:2px 4px;border-radius:3px"
            onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray)'"
            title="Supprimer la suite" title="Fermer">✕</button>
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

  const rows = cards.map((card, i) => {
    const title = card.title || card.files?.[0]?.filename?.replace('.robot','') || 'Bloc ' + (i+1);
    const fileCount = card.files?.length || 0;
    return `<label style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--card);
              border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer"
              onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
      <input type="checkbox" value="${i}" class="suite-picker-cb" style="accent-color:var(--teal);width:16px;height:16px;cursor:pointer" />
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text)">${escHtml(title)}</div>
        <div style="font-size:11px;color:var(--gray)">${fileCount} fichier(s)</div>
      </div>
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
      const mainFile = card.files?.find(f => f.filename.includes('tests.robot')) || card.files?.[0];
      const code = mainFile?.code || '';
      const id = generateSuiteId();

      // Build pomCode for post-reload use
      let pomCode = '';
      if (card.files?.some(f => f.code?.trim())) {
        const fname = 'suite_PLACEHOLDER_' + id + '.robot';
        const pomLines = card.files
          .filter(f => f.code?.trim() && !f.filename.includes('tests.robot'))
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
  savedSuites.splice(idx, 1);
  saveSuitesList();
  renderSavedSuites();
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
        .filter(f => f.code?.trim() && !f.filename.includes('tests.robot'))  // skip shared tests
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
          try {
            const r = await fetch('https://robotstudioai.onrender.com/api/rf/status');
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
  if (finalLbl) finalLbl.textContent = '✅ Suite : ' + suite.title + ' — ' + tests.length + '/' + tests.length + ' terminé';

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

  showToast('✅ Suite ' + suite.title + ' terminée — ' + tests.length + ' bloc(s)');
}


async function runCheckedSuiteGroups() {
  const checked = [...document.querySelectorAll('.suite-group-cb:checked')];
  if (checked.length === 0) { showToast('⚠️ Coche au moins une suite'); return; }
  for (const cb of checked) {
    const suite = savedSuites.find(s => s.id === cb.dataset.suiteId);
    if (suite) {
      const idx = savedSuites.indexOf(suite);
      await runSuiteGroup(idx);
    }
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
  const ids = savedSuites[si]?.testIds;
  if (!ids) return;
  [ids[ti-1], ids[ti]] = [ids[ti], ids[ti-1]];
  renumberSuiteTests(si);
  savedSuites[si].updatedAt = new Date().toISOString();
  saveSuitesList(); saveSuiteRegistry(); renderSavedSuites();
}

function suiteMoveDown(si, ti) {
  const ids = savedSuites[si]?.testIds;
  if (!ids || ti >= ids.length - 1) return;
  [ids[ti], ids[ti+1]] = [ids[ti+1], ids[ti]];
  renumberSuiteTests(si);
  savedSuites[si].updatedAt = new Date().toISOString();
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
// ── Open dashboard inline ──────────────────────────────────────────────────────
function openDashboard() {
  // Open in same tab
  window.open('dashboard.html', '_blank');
}

// ── Debug mode — add Pause Execution before failed keyword ───────────────────
async function activateDebugMode() {
  const code = window._lastGeneratedCode;
  if (!code) { showToast('⚠️ Aucun code trouvé — génère d\'abord un test'); return; }

  // Check if Dialogs library is installed — offer to install if not
  try {
    const check = await fetch('/api/check-library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ library: 'Dialogs' })
    });
    const result = await check.json();
    if (!result.installed) {
      if (confirm('📦 La librairie Dialogs est requise pour le mode debug.\n\nCliquer OK pour l\'installer automatiquement.')) {
        installLibrary('Dialogs');
        return;
      }
      return;
    }
  } catch(e) {}

  // Check if Dialogs library is imported
  let debugCode = code;
  if (!debugCode.includes('Dialogs')) {
    debugCode = debugCode.replace(
      /^(\*\*\* Settings \*\*\*[^\n]*\n)/m,
      '$1Library    Dialogs\n'
    );
  }

  // Add Pause Execution before first keyword call in first test case
  let inserted = false;
  const lines = debugCode.split('\n');
  let inTests = false;
  let inFirstTest = false;
  const result = lines.map(line => {
    if (line.startsWith('*** Test Cases')) { inTests = true; return line; }
    if (line.startsWith('***') && inTests) { inTests = false; return line; }
    if (inTests && line.match(/^[A-Za-z]/)) {
      inFirstTest = !inserted;
      return line;
    }
    if (inFirstTest && !inserted && line.match(/^    [A-Za-z]/)) {
      inserted = true;
      return '    Pause Execution    msg=🐛 Debug — inspecte le navigateur, clique OK pour continuer\n' + line;
    }
    return line;
  });

  debugCode = result.join('\n');
  window._lastGeneratedCode = debugCode;

  // Stop current run first
  await stopTestRun();
  await new Promise(r => setTimeout(r, 800)); // wait for stop

  // Replace current run message instead of creating a new one
  const currentMsg = window._currentRunMsg || document.getElementById(window._currentRunMsgId);
  if (currentMsg) currentMsg.remove();

  showToast('🐛 Mode debug activé — Pause Execution ajouté');

  const filename = (window._lastGeneratedFile || 'test_generated') + '.robot';
  runTestsFromCard(debugCode, filename);
}


// ── Run button handler (Stop ↔ Replay) ───────────────────────────────────────
function handleRunBtn(btn) {
  const state = btn.dataset.state;
  if (state === 'stop') {
    showToast('⏹ Arrêt en cours...');
    stopTestRun();
    setRunBtn(btn, 'replay');
    const lbl = document.getElementById(btn.dataset.runid + '-label');
    if (lbl) { lbl.textContent = '⏹ Arrêté'; lbl.style.color = 'var(--gray)'; }
    localStorage.removeItem('qa_active_run');
  } else {
    const code = window._lastGeneratedCode
      || localStorage.getItem('qa_last_code');
    const file = localStorage.getItem('qa_last_filename')
      || (window._lastGeneratedFile || 'test_generated') + '.robot';
    if (!code) { showToast('⚠️ Aucun test à rejouer'); return; }
    window._lastGeneratedCode = code;
    runTestsFromCard(code, file);
  }
}

function setRunBtn(btn, state) {
  if (!btn) return;
  btn.dataset.state = state;
  if (state === 'stop') {
    btn.textContent = '⏹ Stop';
    btn.style.background = 'rgba(220,38,38,0.12)';
    btn.style.border = '1px solid rgba(220,38,38,0.35)';
    btn.style.color = 'var(--red)';
  } else {
    btn.textContent = '🔁 Replay';
    btn.style.background = 'rgba(0,212,170,0.1)';
    btn.style.border = '1px solid var(--teal)';
    btn.style.color = 'var(--teal)';
  }
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

// ── Update UI based on selected library ──────────────────────────────────────
function onLibraryChange() {
  const lib        = document.getElementById('optLibrary')?.value;
  const headlessEl = document.getElementById('optHeadless');
  const sessionEl  = document.getElementById('optBrowserSession');

  if (!headlessEl) return;

  // Remove existing warning
  document.getElementById('libWarning')?.remove();

  if (lib === 'AppiumLibrary') {
    headlessEl.value = 'headless'; headlessEl.disabled = true; headlessEl.style.opacity = '0.4';
    if (sessionEl) { sessionEl.disabled = true; sessionEl.style.opacity = '0.4'; }
    // Show Appium warning
    const warn = document.createElement('div');
    warn.id = 'libWarning';
    warn.style.cssText = 'margin:8px 6px 0;padding:10px 12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:7px;font-size:11px;color:var(--warn);line-height:1.6';
    warn.innerHTML = '<div style="display:flex;justify-content:space-between"><span>⚠️ <strong>Appium requis</strong></span><span onclick="this.closest(div.id)" style="cursor:pointer;color:var(--gray)">✕</span></div>Avant de lancer les tests :<br>1. Démarrer Appium Server : <code>appium</code><br>2. Émulateur Android (AVD) ou device USB<br>3. Web mobile : browserName=Chrome (pas d\'APK)<br>4. App native : fournir le chemin APK';
    warn.querySelector('span:last-child').onclick = () => warn.remove();
    document.getElementById('optLibrary')?.closest('.opt-row')?.after(warn);
  } else if (lib === 'RequestsLibrary') {
    headlessEl.value = 'headless'; headlessEl.disabled = true; headlessEl.style.opacity = '0.4';
    if (sessionEl) { sessionEl.disabled = true; sessionEl.style.opacity = '0.4'; }
    const warn = document.createElement('div');
    warn.id = 'libWarning';
    warn.style.cssText = 'margin:8px 6px 0;padding:10px 12px;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.3);border-radius:7px;font-size:11px;color:#60a5fa;line-height:1.6';
    warn.innerHTML = '<div style="display:flex;justify-content:space-between"><span>ℹ️ <strong>API REST</strong> — Aucun navigateur requis.</span><span style="cursor:pointer;color:var(--gray)">✕</span></div>Installe : <code style="background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:3px">pip install robotframework-requests</code>';
    warn.querySelector('span:last-child').onclick = () => warn.remove();
    document.getElementById('optLibrary')?.closest('.opt-row')?.after(warn);
  } else if (lib === 'DatabaseLibrary') {
    headlessEl.value = 'headless'; headlessEl.disabled = true; headlessEl.style.opacity = '0.4';
    if (sessionEl) { sessionEl.disabled = true; sessionEl.style.opacity = '0.4'; }
    const warn = document.createElement('div');
    warn.id = 'libWarning';
    warn.style.cssText = 'margin:8px 6px 0;padding:10px 12px;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.3);border-radius:7px;font-size:11px;color:#c084fc;line-height:1.6';
    warn.innerHTML = '<div style="display:flex;justify-content:space-between"><span>ℹ️ <strong>Base de données</strong> — Aucun navigateur requis.</span><span style="cursor:pointer;color:var(--gray)">✕</span></div>Installe : <code style="background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:3px">pip install robotframework-databaselibrary pymysql</code>';
    warn.querySelector('span:last-child').onclick = () => warn.remove();
    document.getElementById('optLibrary')?.closest('.opt-row')?.after(warn);
  } else {
    headlessEl.disabled = false; headlessEl.style.opacity = '1';
    if (sessionEl) { sessionEl.disabled = false; sessionEl.style.opacity = '1'; }
  }
}



// ── Install RF library from UI ────────────────────────────────────────────────
function installLibrary(library) {
  const modal = document.createElement('div');
  modal.id = 'installModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:480px;overflow:hidden">
      <div style="padding:16px 20px;background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
        <span style="font-size:15px;font-weight:700;color:var(--text)">📦 Installation de ${library}</span>
      </div>
      <div id="installLog" style="padding:16px 20px;font-family:'IBM Plex Mono',monospace;font-size:12px;
           color:var(--teal);max-height:240px;overflow-y:auto;min-height:80px;background:var(--code)">
        ⏳ Démarrage...
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end">
        <button id="installCloseBtn" onclick="document.getElementById('installModal').remove()" disabled
          style="background:var(--border);border:none;color:var(--gray);padding:8px 20px;border-radius:7px;
                 font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:not-allowed">
          Fermer
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const log = document.getElementById('installLog');
  const addLog = (msg) => { log.innerHTML += '<br>' + msg; log.scrollTop = log.scrollHeight; };

  const es = new EventSource('/api/install-library?library=' + encodeURIComponent(library));

  fetch('/api/install-library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ library })
  });

  // Use SSE-style polling via fetch + ReadableStream
  fetch('/api/install-library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ library })
  }).then(async resp => {
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      text.split('\n').forEach(line => {
        if (!line.startsWith('data:')) return;
        try {
          const d = JSON.parse(line.slice(5).trim());
          if (d.msg) addLog(d.msg);
          if (d.done) {
            const btn = document.getElementById('installCloseBtn');
            if (btn) { btn.disabled = false; btn.style.cssText = 'background:var(--teal);border:none;color:#07090f;padding:8px 20px;border-radius:7px;font-size:12px;font-family:\'IBM Plex Mono\',monospace;cursor:pointer;font-weight:700'; }
            if (d.success) addLog('<span style="color:var(--blue)">✅ Installation terminée ! Relance le test.</span>');
          }
        } catch(e) {}
      });
    }
  }).catch(e => addLog('❌ ' + e.message));
}


// ── Library Manager ───────────────────────────────────────────────────────────
function openLibraryManager() {
  document.getElementById('libManagerModal')?.remove();
  const libs = [
    { name: 'SeleniumLibrary', desc: 'Tests UI Web (Chrome, Firefox)',    pip: 'robotframework-seleniumlibrary' },
    { name: 'Browser',         desc: 'Tests UI Web Playwright',           pip: 'robotframework-browser + rfbrowser init' },
    { name: 'AppiumLibrary',   desc: 'Tests Mobile (Android/iOS)',        pip: 'robotframework-appiumlibrary' },
    { name: 'RequestsLibrary', desc: 'Tests API REST',                    pip: 'robotframework-requests' },
    { name: 'DatabaseLibrary', desc: 'Tests Base de données SQL',         pip: 'robotframework-databaselibrary' },
  ];

  const rows = libs.map(l => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--card);
                border:1px solid var(--border);border-radius:8px;margin-bottom:8px">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text)">${l.name}</div>
        <div style="font-size:11px;color:var(--gray);margin-top:2px">${l.desc}</div>
        <div style="font-size:10px;color:var(--muted);font-family:'IBM Plex Mono',monospace;margin-top:2px">${l.pip}</div>
      </div>
      <button onclick="installLibrary('${l.name}');document.getElementById('libManagerModal').remove()"
        style="background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);
               padding:6px 14px;border-radius:6px;font-size:11px;font-family:'IBM Plex Mono',monospace;
               cursor:pointer;white-space:nowrap;flex-shrink:0">
        📦 Installer
      </button>
    </div>`).join('');

  const modal = document.createElement('div');
  modal.id = 'libManagerModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:520px">
      <div style="display:flex;align-items:center;padding:16px 20px;background:var(--card);border-bottom:1px solid var(--border)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">📦 Gestionnaire de librairies RF</span>
        <button onclick="document.getElementById('libManagerModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="padding:16px 20px">${rows}</div>
    </div>`;
  document.body.appendChild(modal);
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

  if (countEl) countEl.textContent = matches.length ? matches.length + ' résultat(s)' : 'Aucun résultat';

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

  if (allCards.length === 0) { showToast('⚠️ Aucun autre bloc de code disponible'); return; }

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
        <div style="font-size:10px;color:var(--gray)">${(card.files||[]).length} fichier(s)</div>
      </div>
    </label>`;
  }).join('');

  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:500px">
      <div style="display:flex;align-items:center;padding:16px 20px;background:var(--card);border-bottom:1px solid var(--border)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">🔀 Fusionner des blocs de code</span>
        <button onclick="document.getElementById('codeMergeModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="padding:16px 20px;max-height:320px;overflow-y:auto">
        <div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;letter-spacing:1px;margin-bottom:12px">
          SÉLECTIONNE LES BLOCS À FUSIONNER DANS CE BLOC
        </div>
        ${rows}
      </div>
      <div style="display:flex;gap:10px;padding:14px 20px;border-top:1px solid var(--border);background:var(--card)">
        <button id="codeMergeConfirmBtn""
          style="flex:1;background:linear-gradient(135deg,var(--teal),#00a882);border:none;color:#07090f;
                 padding:10px;border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:700;cursor:pointer">
          🔀 Fusionner la sélection
        </button>
        <button onclick="document.getElementById('codeMergeModal').remove()"
          style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:10px 16px;
                 border-radius:8px;font-size:13px;font-family:'IBM Plex Mono',monospace;cursor:pointer">
          Annuler
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
  if (checked.length === 0) { showToast('⚠️ Sélectionne au moins un bloc'); return; }

  const targetCard = (window._codeCards||[]).find(c => c.cardId === targetCardId);
  if (!targetCard) { showToast('⚠️ Bloc cible introuvable'); return; }

  // Use cards stored when modal was opened (same order as checkboxes)
  const allCards = window._codeMergeCards || [];

  checked.forEach(cb => {
    const idx = parseInt(cb.value);
    const srcCard = allCards[idx];
    if (!srcCard || !srcCard.files?.length) return;

    // Merge files
    const existingFiles = new Set(targetCard.files.map(f => f.filename));
    srcCard.files.forEach(f => {
      if (!existingFiles.has(f.filename)) {
        targetCard.files.push({ ...f });
        existingFiles.add(f.filename);
      } else {
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

  // Renumber TC_XXX sequentially in tests.robot
  targetCard.files = targetCard.files.map(f => {
    if (!f.filename.includes('tests.robot')) return f;
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
  showToast('🔀 ' + checked.length + ' bloc(s) fusionné(s) avec succès !');
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
  showInputDialog('✏️ Renommer le dossier', 'Nouveau nom', oldName, newName => {
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
    showToast('✏️ Dossier renommé en ' + newName.trim());
  });
}

// ── Folder delete ─────────────────────────────────────────────────────────────
function treeFolderDelete(e, folder, cardId) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const card = (window._codeCards||[]).find(c => c.cardId === cardId);
  if (!card) return;
  const count = card.files.filter(f => f.filename.startsWith(folder + '/') && !f.filename.endsWith('.gitkeep')).length;
  showConfirmDialog('🗑 Supprimer le dossier',
    'Supprimer <b>' + escHtml(folder.split('/').pop()) + '</b>' + (count ? ' et ses <b>' + count + '</b> fichier(s)' : ' (vide)') + ' ?',
    () => {
      card.files = card.files.filter(f => !f.filename.startsWith(folder + '/'));
      saveCodeCards();
      const el = document.getElementById(cardId);
      if (el) { el.remove(); renderResultCard(card.files, cardId); }
      showToast('🗑 Dossier supprimé');
    }
  );
}


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
    try {
      localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards));
      // qa_run_history supprimé — données dans qa_code_cards
    } catch(e) {}
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
    // Persiste directement sans passer par saveCodeCards (évite reset des stats)
    try { localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards)); } catch(e) {}
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

// ── Multi-provider support ────────────────────────────────────────────────────
const PROVIDER_MODELS = {
  anthropic: [
    { value: 'claude-haiku-4-5-20251001', label: '⚡ Claude Haiku 4.5' },
    { value: 'claude-sonnet-4-6',          label: '🧠 Claude Sonnet 4.6' },
    { value: 'claude-opus-4-7',            label: '💎 Claude Opus 4.7' },
  ],
  openai: [
    { value: 'gpt-4o-mini',   label: '⚡ GPT-4o mini' },
    { value: 'gpt-4o',        label: '🧠 GPT-4o' },
    { value: 'gpt-4.1',       label: '💎 GPT-4.1' },
    { value: 'o4-mini',       label: '🔬 o4-mini' },
  ],
  gemini: [
    { value: 'gemini-2.0-flash-lite',          label: '⚡ Gemini 2.0 Flash Lite' },
    { value: 'gemini-2.0-flash',               label: '🧠 Gemini 2.0 Flash' },
    { value: 'gemini-2.5-flash-preview-05-20', label: '✨ Gemini 2.5 Flash Preview' },
    { value: 'gemini-2.5-pro-preview-05-06',   label: '💎 Gemini 2.5 Pro Preview' },
  ],
  mistral: [
    { value: 'mistral-small-latest',   label: '⚡ Mistral Small' },
    { value: 'mistral-medium-latest',  label: '🧠 Mistral Medium' },
    { value: 'mistral-large-latest',   label: '💎 Mistral Large' },
    { value: 'codestral-latest',       label: '💻 Codestral' },
  ],
};

const PROVIDER_PLACEHOLDER = {
  anthropic: 'Clé API Anthropic...',
  openai:    'Clé API OpenAI (sk-...)',
  gemini:    'Clé API Google AI...',
  mistral:   'Clé API Mistral...',
};

function onProviderChange(provider) {
  localStorage.setItem('qa_provider', provider);
  // Update model list
  const sel = document.getElementById('modelSelect');
  if (!sel) return;
  const models = PROVIDER_MODELS[provider] || PROVIDER_MODELS.anthropic;
  sel.innerHTML = models.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
  sel.value = models[1]?.value || models[0]?.value;
  localStorage.setItem('qa_agent_model', sel.value);
  // Update placeholder
  const key = document.getElementById('apiKey');
  if (key) key.placeholder = PROVIDER_PLACEHOLDER[provider] || 'Clé API...';
  // Remet le statut seulement si pas de clé déjà saisie
  const existingKey = document.getElementById('apiKey')?.value || '';
  if (!existingKey) {
    document.getElementById('keyStatus').textContent = '⬤ no key';
    document.getElementById('keyStatus').classList.remove('ok');
  } else {
    updateKeyStatus(existingKey);
  }
}

function getCurrentProvider() {
  return localStorage.getItem('qa_provider') || 'anthropic';
}

// ── Universal API call ─────────────────────────────────────────────────────────
async function callAI(apiKey, messages, systemPrompt, maxTokens = 2048) {
  const provider = getCurrentProvider();
  const model    = document.getElementById('modelSelect')?.value || 'claude-sonnet-4-6';

  if (provider === 'openai') {
    // o-series models don't support system role — inject as first user message
    const isOSeries = model.startsWith('o');
    let msgs;
    if (isOSeries) {
      msgs = systemPrompt
        ? [{ role: 'user', content: systemPrompt }, { role: 'assistant', content: 'Understood.' }, ...messages]
        : messages;
    } else {
      msgs = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;
    }
    const tokenParam = isOSeries ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens };
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model, ...tokenParam, messages: msgs }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || 'OpenAI error ' + r.status); }
    const d = await r.json();
    return d.choices[0]?.message?.content?.trim() || '';

  } else if (provider === 'gemini') {
    // Gemini requires alternating user/model roles — merge consecutive same-role messages
    const rawParts = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const parts = [];
    for (const p of rawParts) {
      if (parts.length > 0 && parts[parts.length-1].role === p.role) {
        parts[parts.length-1].parts[0].text += '\n' + p.parts[0].text;
      } else {
        parts.push(p);
      }
    }
    // Gemini requires first message to be user
    if (parts.length > 0 && parts[0].role !== 'user') parts.shift();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = { contents: parts };
    if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || 'Gemini error ' + r.status); }
    const d = await r.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  } else if (provider === 'mistral') {
    const msgs = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;
    const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: msgs }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || 'Mistral error ' + r.status); }
    const d = await r.json();
    return d.choices[0]?.message?.content?.trim() || '';

  } else {
    // Anthropic (default)
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, ...(systemPrompt ? { system: systemPrompt } : {}), messages }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || 'Anthropic error ' + r.status); }
    const d = await r.json();
    return d.content[0]?.text?.trim() || '';
  }
}async function callClaudeRaw(apiKey, prompt) {
  const sys = `You are a Robot Framework expert. Output ONLY valid Robot Framework code. No explanations, no markdown fences, no comments outside RF syntax. ${getSessionRules()}`;
  return await callAI(apiKey, [{ role: 'user', content: prompt }], sys, 4096);
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
