// ============================================================================
// generation.js — orchestration IA & génération (chat, generateCode*, callAI/callClaude,
//                 providers, library). Utilise prompts.js. Extrait de qa-agent.js.
// ============================================================================

// ── Send message ───────────────────────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text  = input.value.trim();
  if (!text || isThinking) return;

  // Clé côté serveur uniquement : _serverApiKey est un booléen "configuré".
  const apiKey = window._serverApiKey;
  if (!apiKey) {
    showToast(t('gen.configApiKey').replace('{provider}', getCurrentProvider()));
    return;
  }

  input.value = '';
  input.style.height = 'auto';
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
      await generateCodeFromCases(window._serverApiKey);
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
    renderAgentMsg(t('gen.errorPrefix') + err.message);
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
      renderAgentMsg(t('gen.apiErrorPrefix') + msg);
    } else {
      // Fallback: display raw text if JSON parse fails
      renderAgentMsg(t('gen.proposedCases').replace('{msg}', msg));
    }
  }
}
// ── Generate RF code from a specific card (not just pendingTestCases) ─────────
async function generateCodeFromCard(cardId, apiKey) {
  if (!apiKey || false /* provider key check disabled */) {
    showToast('⚠️ Configure ta clé API');
    return;
  }
  const store = TC_STORE[cardId];
  if (!store) { showToast(t('gen.blockNotFound')); return; }

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
    showToast(t('gen.multiFileAuto'));
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
  const code = await callClaudeRaw(apiKey, caseInstruction + buildRfPrompt(description, library, style, effectiveMode), library);
    hideTyping();
    // Clear pending so nothing else triggers a second generation
    pendingTestCases = null;
    LS.save();
    const filename = 'test_' + store.pages.map(p => (p.label||'page').replace(/[^a-z0-9]/gi,'_').toLowerCase()).join('_') + '.robot';
    if (effectiveMode === 'multi') renderMultiFileMsg(code);
    else renderCodeMsg(code, filename);
  } catch(err) {
    hideTyping();
    renderAgentMsg(t('gen.genErrorPrefix') + err.message);
  } finally {
    window._generatingCode = false;
  }
}
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
    const code = await callClaudeRaw(apiKey, buildRfPrompt(description, library, style, 'multi'), library);
    hideTyping();
    pendingTestCases = null;
    pendingBlocks    = [];
    LS.save();
    renderMultiFileMsg(code);
  } catch(err) {
    hideTyping();
    renderAgentMsg(t('gen.pomErrorPrefix') + err.message);
  }
}

// ── STEP 2 : Générer le code RF depuis les cas en attente ─────────────────────
async function generateCodeFromCases(apiKey) {
  if (!apiKey) apiKey = window._serverApiKey;
  if (!apiKey || false /* provider key check disabled */) {
    showToast(t('gen.configApiKey').replace('{provider}', getCurrentProvider()));
    return;
  }
  if (!pendingTestCases || window._generatingCode) {
    if (!pendingTestCases) renderAgentMsg(t('gen.noPendingCases'));
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
    const code = await callClaudeRaw(apiKey, buildRfPrompt(description, library, style, mode), library);
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
    renderAgentMsg(t('gen.genErrorPrefix') + err.message);
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
    const code = await callClaudeRaw(apiKey, prompt, library);
    hideTyping();

    if (mode === 'multi') {
      renderMultiFileMsg(code);
    } else {
      renderCodeMsg(code, `test_us_${us.id}.robot`);
    }

  } catch(err) {
    hideTyping();
    renderAgentMsg(t('gen.genErrorPrefix') + err.message);
  }
}

// ── Call Claude (conversational) ───────────────────────────────────────────────
async function callClaude(apiKey, userText) {
  const library = document.getElementById('optLibrary')?.value || 'SeleniumLibrary';
  const style   = document.getElementById('optStyle')?.value   || 'keyword-driven';
  // getSessionRules() = keywords Selenium en dur -> UNIQUEMENT SeleniumLibrary (sinon mélange
  // Library SeleniumLibrary + Library Browser, ou keywords navigateur parasites pour API/DB/Appium).
  const sessionRules = library === 'SeleniumLibrary' ? ' ' + getSessionRules() : '';
  const system  = `Tu es un expert QA spécialisé Robot Framework. Tu aides à générer, analyser et améliorer des tests automatisés. Sois concis et pratique. Si on te demande de générer des tests RF, génère-les directement.${sessionRules}`;

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
    ).map(function(m) {
      var c = m.content.replace(/<span[^>]*>/g,'').replace(/<\/span>/g,'');
      c = c.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
      return { role: m.role, content: c };
    }),
    { role: 'user', content: userText },
  ];

  return await callAI(messages, system, 2048);
}


// ── Call Claude for RF generation (raw code output) ───────────────────────────

// ── Haiku API call — fast, for TC generation (JSON responses) ─────────────────
async function callClaudeHaiku(apiKey, prompt) {
  return await callAI([{ role: 'user', content: prompt }], null, 2048);
}


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
    warn.innerHTML = t('gen.appiumWarn');
    warn.querySelector('span:last-child').onclick = () => warn.remove();
    document.getElementById('optLibrary')?.closest('.opt-row')?.after(warn);
  } else if (lib === 'RequestsLibrary') {
    headlessEl.value = 'headless'; headlessEl.disabled = true; headlessEl.style.opacity = '0.4';
    if (sessionEl) { sessionEl.disabled = true; sessionEl.style.opacity = '0.4'; }
    const warn = document.createElement('div');
    warn.id = 'libWarning';
    warn.style.cssText = 'margin:8px 6px 0;padding:10px 12px;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.3);border-radius:7px;font-size:11px;color:#60a5fa;line-height:1.6';
    warn.innerHTML = t('gen.apiRestWarn');
    warn.querySelector('span:last-child').onclick = () => warn.remove();
    document.getElementById('optLibrary')?.closest('.opt-row')?.after(warn);
  } else if (lib === 'DatabaseLibrary') {
    headlessEl.value = 'headless'; headlessEl.disabled = true; headlessEl.style.opacity = '0.4';
    if (sessionEl) { sessionEl.disabled = true; sessionEl.style.opacity = '0.4'; }
    const warn = document.createElement('div');
    warn.id = 'libWarning';
    warn.style.cssText = 'margin:8px 6px 0;padding:10px 12px;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.3);border-radius:7px;font-size:11px;color:#c084fc;line-height:1.6';
    warn.innerHTML = t('gen.dbWarn');
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
        <span style="font-size:15px;font-weight:700;color:var(--text)">${t('gen.installTitle').replace('{library}', library)}</span>
      </div>
      <div id="installLog" style="padding:16px 20px;font-family:'IBM Plex Mono',monospace;font-size:12px;
           color:var(--teal);max-height:240px;overflow-y:auto;min-height:80px;background:var(--code)">
        ${t('gen.starting')}
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end">
        <button id="installCloseBtn" onclick="document.getElementById('installModal').remove()" disabled
          style="background:var(--border);border:none;color:var(--gray);padding:8px 20px;border-radius:7px;
                 font-size:12px;font-family:'IBM Plex Mono',monospace;cursor:not-allowed">
          ${t('gen.close')}
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const log = document.getElementById('installLog');
  const addLog = (msg) => { log.innerHTML += '<br>' + msg; log.scrollTop = log.scrollHeight; };

  const es = new EventSource(window._runnerBase + '/api/install-library?library=' + encodeURIComponent(library));

  fetch(window._runnerBase + '/api/install-library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ library })
  });

  // Use SSE-style polling via fetch + ReadableStream
  fetch(window._runnerBase + '/api/install-library', {
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
            if (d.success) addLog('<span style="color:var(--blue)">' + t('gen.installDone') + '</span>');
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
    { name: 'SeleniumLibrary', desc: t('gen.descWeb'),        pip: 'robotframework-seleniumlibrary' },
    { name: 'Browser',         desc: t('gen.descPlaywright'), pip: 'robotframework-browser + rfbrowser init' },
    { name: 'AppiumLibrary',   desc: t('gen.descMobile'),     pip: 'robotframework-appiumlibrary' },
    { name: 'RequestsLibrary', desc: t('gen.descApi'),        pip: 'robotframework-requests' },
    { name: 'DatabaseLibrary', desc: t('gen.descDb'),         pip: 'robotframework-databaselibrary' },
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
        ${t('gen.installBtn')}
      </button>
    </div>`).join('');

  const modal = document.createElement('div');
  modal.id = 'libManagerModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:520px">
      <div style="display:flex;align-items:center;padding:16px 20px;background:var(--card);border-bottom:1px solid var(--border)">
        <span style="font-size:15px;font-weight:700;color:var(--text)">${t('gen.libManagerTitle')}</span>
        <button onclick="document.getElementById('libManagerModal').remove()"
          style="margin-left:auto;background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="padding:16px 20px">${rows}</div>
    </div>`;
  document.body.appendChild(modal);
}
// ── Multi-provider support ────────────────────────────────────────────────────
const PROVIDER_MODELS = {
  anthropic: [
    { value: 'claude-opus-4-8',            label: '🌟 Claude Opus 4.8' },
    { value: 'claude-opus-4-7',            label: '💎 Claude Opus 4.7' },
    { value: 'claude-opus-4-6',            label: '💎 Claude Opus 4.6' },
    { value: 'claude-sonnet-4-6',          label: '🧠 Claude Sonnet 4.6' },
    { value: 'claude-haiku-4-5-20251001',  label: '⚡ Claude Haiku 4.5' },
  ],
  openai: [
    { value: 'gpt-4.1',           label: '🧠 GPT-4.1' },
    { value: 'gpt-4.1-mini',      label: '⚡ GPT-4.1 Mini' },
    { value: 'gpt-4.1-nano',      label: '🚀 GPT-4.1 Nano' },
    { value: 'gpt-4o',            label: '🔵 GPT-4o' },
    { value: 'gpt-4o-mini',       label: '💨 GPT-4o Mini' },
  ],
  gemini: [
    { value: 'gemini-3.1-pro-preview',       label: '🌟 Gemini 3.1 Pro Preview' },
    { value: 'gemini-3-flash-preview',       label: '⚡ Gemini 3 Flash Preview' },
    { value: 'gemini-2.5-pro',               label: '💎 Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash',             label: '✨ Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite-preview-06-17', label: '🚀 Gemini 2.5 Flash Lite' },
    { value: 'gemini-2.0-flash',             label: '💨 Gemini 2.0 Flash' },
  ],
  mistral: [
    { value: 'mistral-large-latest',   label: '💎 Mistral Large 3' },
    { value: 'mistral-small-latest',   label: '⚡ Mistral Small 4' },
    { value: 'mistral-medium-latest',  label: '🧠 Mistral Medium' },
    { value: 'open-mistral-nemo',      label: '🌐 Mistral Nemo' },
  ],
};

// Clés i18n (résolues via t() au moment de l'usage pour refléter la langue courante)
const PROVIDER_PLACEHOLDER = {
  anthropic: 'gen.phAnthropic',
  openai:    'gen.phOpenai',
  gemini:    'gen.phGemini',
  mistral:   'gen.phMistral',
};

async function loadApiKeyForProvider(provider) {
  try {
    const tokenR = await fetch('/api/config/token');
    const tokenD = await tokenR.json();
    const keyR = await fetch(`/api/config/apikey?token=${tokenD.token}&provider=${provider}`);
    if (keyR.ok) {
      const keyD = await keyR.json();
      window._serverApiKey = !!keyD.configured;
      updateKeyStatus(window._serverApiKey);
      return window._serverApiKey;
    }
  } catch(e) {}
  window._serverApiKey = false;
  updateKeyStatus(false);
  return false;
}

function onProviderChange(provider) {
  localStorage.setItem('qa_provider', provider);
  loadApiKeyForProvider(provider);
  populateModels(provider);   // liste dynamique via /api/models (fallback PROVIDER_MODELS)
}

// Peuple #modelSelect depuis /api/models (dynamique) ; fallback PROVIDER_MODELS si échec. Générique (4 providers).
async function populateModels(provider) {
  const sel = document.getElementById('modelSelect');
  if (!sel) return;
  window._modelCache = window._modelCache || {};
  let models = window._modelCache[provider];
  if (!models) {
    try {
      const token = await _getSessionToken();
      const r = await fetch(`/api/models?provider=${provider}&token=${token}`);
      const d = await r.json();
      if (d.ok && Array.isArray(d.models) && d.models.length) models = d.models;
    } catch (e) {}
    if (!models) models = PROVIDER_MODELS[provider] || PROVIDER_MODELS.anthropic;   // FALLBACK
    window._modelCache[provider] = models;
  }
  const want = localStorage.getItem('qa_agent_model') || sel.value;   // préserve la sélection
  sel.innerHTML = models.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
  sel.value = models.some(m => m.value === want) ? want : (models[0]?.value || '');
  localStorage.setItem('qa_agent_model', sel.value);
}

function getCurrentProvider() {
  return localStorage.getItem('qa_provider') || 'anthropic';
}

// ── Universal API call ─────────────────────────────────────────────────────────
// ── Snapshot DOM de l appli cible pour guider la generation ──────────────────
async function fetchDomSnapshot(text) {
  try {
    const m = String(text || '').match(/https?:\/\/[^\s"'<>)]+/);
    if (!m) return '';
    const r = await fetch(window._runnerBase + '/api/inspect-dom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: m[0], wait: 3 })
    });
    if (!r.ok) return '';
    const d = await r.json();
    if (!d || d.error || !d.elements || !d.elements.length) return '';
    const lines = d.elements.map(e => JSON.stringify(e));
    return '\n\nDOM SNAPSHOT — elements interactifs REELS de ' + d.url
         + ' (titre: ' + (d.title || '') + ').\n'
         + 'REGLE STRICTE: utilise EXCLUSIVEMENT des selecteurs derives de ces elements'
         + ' (priorite: id > name > data-testid > css court). N invente JAMAIS un id ou une classe.\n'
         + 'Si un selecteur (notamment data-testid) peut matcher PLUSIEURS elements (listes, items repetes),'
         + ' cible UN SEUL element via un index ou un parent unique (Browser/Playwright: >> nth=N ; Selenium: (//...)[N] ou :nth-child(N)).\n'
         + lines.join('\n') + '\n';
  } catch (e) { return ''; }
}

// [PROXY] Token de session mis en cache (récupéré une fois, réutilisé pour /api/ai).
async function _getSessionToken() {
  if (window._sessionToken) return window._sessionToken;
  try {
    const d = await (await fetch('/api/config/token')).json();
    window._sessionToken = d.token;
  } catch (e) {}
  return window._sessionToken;
}
// [PROXY] Plus AUCUN appel direct provider : on relaie via /api/ai (clé côté serveur).
// Les 4 branches + transformations (o-series, rôles Gemini, nettoyage Anthropic) vivent désormais dans server.js.
async function callAI(messages, systemPrompt, maxTokens = 2048) {
  const provider = getCurrentProvider();
  const model    = document.getElementById('modelSelect')?.value || 'claude-sonnet-4-6';
  const token    = await _getSessionToken();
  const r = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, provider, model, messages, systemPrompt, maxTokens }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || 'AI error ' + r.status); }
  const d = await r.json();
  return d.text || '';
}async function callClaudeRaw(apiKey, prompt, library, maxTokens = 4096) {
  // Deux usages distincts, NE PAS confondre :
  // - getSessionRules() = keywords Selenium en dur (Open Browser No Popup / executable_path / Close Browser)
  //   -> UNIQUEMENT SeleniumLibrary. Browser/Playwright gère sa session via New Browser/New Context/New Page
  //      (cf. buildRfPromptBrowser) : y injecter getSessionRules force un import SeleniumLibrary parasite
  //      => mélange "Library SeleniumLibrary + Library Browser" = code inexécutable.
  // - fetchDomSnapshot() = sélecteurs réels du web. S'applique à TOUT web desktop (Selenium ET Browser),
  //   PAS à API (RequestsLibrary), DB (DatabaseLibrary), mobile (AppiumLibrary).
  const needsSessionRules = library === 'SeleniumLibrary';
  const needsDomSnapshot  = library !== 'RequestsLibrary' && library !== 'DatabaseLibrary' && library !== 'AppiumLibrary';
  const sys = `You are a Robot Framework expert. Output ONLY valid Robot Framework code. No explanations, no markdown fences, no comments outside RF syntax.${needsSessionRules ? ' ' + getSessionRules() : ''}`;
  const domSnap = needsDomSnapshot ? await fetchDomSnapshot(prompt) : '';
  if (domSnap) console.log('[DOM-AWARE] snapshot injecte (' + domSnap.length + ' chars)');
  return await callAI([{ role: 'user', content: prompt + domSnap }], sys, maxTokens);
}



