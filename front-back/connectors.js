// ============================================================================
// connectors.js — Azure & Jira (connexion/fetch/génération), cartes de connexion,
//                 UI Azure/Jira, helpers clé API. Extrait de qa-agent.js.
// ============================================================================

// Appels API en chemin relatif (/api/...) : se résolvent contre l'origine du document
// -> local tape localhost, prod tape Render, sans hardcode.

// ── API key (attached in DOMContentLoaded below) ──────────────────────────────

function updateKeyStatus(val) {
  const el = document.getElementById('keyStatus');
  const provider = getCurrentProvider();
  const minLen = { anthropic: 20, openai: 20, gemini: 10, mistral: 10 };
  const ok = val && val.length >= (minLen[provider] || 10);
  el.textContent = ok ? t('conn.ready') : t('conn.noKey');
  el.className   = 'key-status' + (ok ? ' ok' : '');
}
// ── Azure connect — direct browser call ───────────────────────────────────────
function parseAzureUrl(url) {
  const parsed = new URL(url.trim());
  let parts  = parsed.pathname.replace(/^\//, '').split('/').filter(Boolean);
  // URL repo (.../_git/{repo}) : retirer _git + repo pour ne garder que {org?}/{project?}.
  // project omis -> = repo. Évite project='_git' qui produit une URL API invalide -> HTML.
  let repo = null;
  const gi = parts.indexOf('_git');
  if (gi >= 0) { repo = parts[gi + 1] || null; parts = parts.slice(0, gi); }
  let org, project;
  if (parsed.hostname === 'dev.azure.com') { org = parts[0]; project = parts[1] || repo; }
  else { org = parsed.hostname.split('.')[0]; project = parts[0] || repo; }
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
    if (!org) {   // projet non requis : récup US au niveau org (IDs uniques par organisation)
      hideTyping();
      renderAgentMsg(t('conn.msg.urlInvalid'));
      return;
    }

    // Valide au niveau ORGANISATION (le projet n'est pas requis : work items uniques par org).
    const testUrl = `https://dev.azure.com/${org}/_apis/projects?api-version=7.0`;
    const r = await azureFetch(testUrl, token);
    hideTyping();

    if (r.status === 401) { renderAgentMsg(t('conn.msg.tokenInvalid')); return; }
    if (r.status === 404) { renderAgentMsg(t('conn.msg.projectNotFound').replace('{project}', project || org).replace('{org}', org)); return; }
    // Page HTML (page de connexion) = PAT rejeté / SSO requis, même avec un statut 2xx (203 fréquent).
    const _ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!_ct.includes('json')) { renderAgentMsg(t('conn.msg.tokenInvalid')); return; }
    if (!r.ok)            { renderAgentMsg(t('conn.msg.azureHttpError').replace('{status}', r.status)); return; }

    azureSession = { org, project, token };
    LS.save();
    renderAgentMsg(`${t('conn.msg.azureConnected')}\n\n<span class="tag azure">📁 ${org}</span> <span class="tag rf">🗂 ${project || org}</span>\n\n${t('conn.msg.askUsNumber')}`);

  } catch(err) {
    hideTyping();
    renderAgentMsg(t('conn.msg.azureConnError').replace('{err}', err.message));
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
    // Niveau ORG (sans projet) : les IDs de work items sont uniques dans l'organisation.
    const url = `https://dev.azure.com/${org}/_apis/wit/workitems/${id}?fields=${fields}&api-version=7.0`;
    const r   = await azureFetch(url, token);
    hideTyping();
    // Azure renvoie une page HTML (connexion) si le PAT est invalide/expiré ou si SSO/accès
    // conditionnel est requis -> r.json() planterait sur "<!DOCTYPE" ("Unexpected token <").
    const _ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!_ct.includes('json')) {
      renderAgentMsg(currentLang === 'en'
        ? '❌ Azure returned a non-JSON (HTML) response — invalid PAT or SSO/conditional access required. Check your token and the org/project URL.'
        : '❌ Azure a renvoyé une réponse non-JSON (HTML) — token (PAT) invalide ou SSO/accès conditionnel requis. Vérifie ton token et l’URL org/projet.');
      return;
    }
    let data;
    try { data = await r.json(); }
    catch(e) { renderAgentMsg(currentLang === 'en' ? '❌ Azure: invalid JSON response.' : '❌ Azure : réponse JSON invalide.'); return; }
    if (data && data.stopped === true) { window._rfRunning = false; window._currentRunMsg = null; return; }

    if (!r.ok) {
      renderAgentMsg(t('conn.msg.workItemNotFound').replace('{id}', id).replace('{msg}', data.message || r.status));
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
    const usCardId = 'azure-us-' + Date.now();
    const div = document.createElement('div');
    div.className = 'msg agent';
    div.id = usCardId;

    if (shouldGenerate) {
      // Comportement direct (appelé avec shouldGenerate=true ailleurs) — inchangé.
      div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="msg-bubble">
          ${t('conn.card.usRetrieved')} #${id} :${cardHtml}
          <br>${t('conn.card.generating')}
        </div>
      </div>`;
      document.getElementById('messages').appendChild(div);
      chatHistory.push({ role: 'assistant', content: `[US Card #${id}: ${us.title}]` });
      LS.save();
      scrollToBottom();
      await generateTestCasesFromIssue(us, apiKey);
    } else {
      // Carte + question + 2 boutons (aligné sur handleJiraFetch) -> ATTEND le clic.
      div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="msg-bubble">
          ${t('conn.card.usRetrieved')} #${id} :${cardHtml}
          <div style="margin-top:12px;font-size:13px;color:#8ab4c4">
            ${t('conn.card.askGenerateCases')}
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button data-issue-card="${usCardId}" data-action="yes"
              style="background:rgba(0,212,170,0.12);border:1px solid var(--teal);color:var(--teal);padding:8px 20px;border-radius:7px;font-size:13px;font-family:'Syne',sans-serif;font-weight:600;cursor:pointer">
              ${t('conn.card.yesGenerate')}
            </button>
            <button data-issue-card="${usCardId}" data-action="no"
              style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:8px 16px;border-radius:7px;font-size:13px;font-family:'Syne',sans-serif;cursor:pointer">
              ${t('conn.card.noThanks')}
            </button>
          </div>
        </div>
      </div>`;
      document.getElementById('messages').appendChild(div);

      // Stocker l'US pour le clic (même mécanisme que Jira : window._pendingIssues)
      window._pendingIssues = window._pendingIssues || {};
      window._pendingIssues[usCardId] = { issue: us, apiKey };

      div.addEventListener('click', async e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const stored = window._pendingIssues[usCardId];
        // Retirer les boutons après le choix
        div.querySelectorAll('[data-action]').forEach(b => b.remove());
        if (action === 'yes' && stored) {
          await generateTestCasesFromIssue(stored.issue, stored.apiKey);
        }
        // "no" -> ne rien générer
      });

      chatHistory.push({ role: 'assistant', content: `[US Card #${id}: ${us.title}]` });
      LS.save();
      scrollToBottom();
    }

  } catch(err) {
    hideTyping();
    if (err.message.includes('fetch') || err.message.includes('Failed')) {
      renderAgentMsg(t('conn.msg.proxyNotStarted'));
    } else {
      renderAgentMsg(t('conn.msg.errorPrefix').replace('{err}', err.message));
    }
  }
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
      renderAgentMsg(t('conn.msg.jiraEmailRequired'));
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
    if (data && data.stopped === true) { window._currentRunMsg = null; return; }

    if (r.status === 401) { renderAgentMsg(t('conn.msg.jiraTokenInvalid')); return; }
    if (!r.ok)            { renderAgentMsg(t('conn.msg.jiraHttpError').replace('{status}', r.status)); return; }

    jiraSession = { host, email, token, b64, displayName: data.displayName };
    LS.save();
    renderAgentMsg(`${t('conn.msg.jiraConnected')}\n\n<span class="tag jira">🟦 ${host}</span> — ${t('conn.msg.greeting').replace('{name}', data.displayName)}\n\n${t('conn.msg.askUsNumberJira')}`);

  } catch(err) {
    hideTyping();
    renderAgentMsg(t('conn.msg.jiraConnError').replace('{err}', err.message));
  }
}

async function handleJiraFetch(id, shouldGenerate, apiKey) {
  showTyping();
  try {
    const { host, b64 } = jiraSession;

    // id can be "PROJ-42" or just "42" — if just a number, ask for full key
    const issueKey = /^\d+$/.test(id)
      ? (() => { hideTyping(); renderAgentMsg(t('conn.msg.issueKeyRequired').replace('{id}', id)); return null; })()
      : id.toUpperCase();

    if (!issueKey) return;

    const r  = await fetch(`/api/jira/issue/${issueKey}`);
    const data = await r.json();
    hideTyping();
    if (data && data.stopped === true) { window._currentRunMsg = null; return; }

    if (r.status === 404) { renderAgentMsg(t('conn.msg.issueNotFound').replace('{issueKey}', issueKey)); return; }
    if (!r.ok)            { renderAgentMsg(t('conn.msg.jiraError').replace('{err}', data.error || r.status)); return; }

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
      if (t.includes('bug')    || t.includes('défaut'))  return `<span style="background:rgba(230,57,70,0.15);color:#DC2626;border:1px solid rgba(230,57,70,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">${window.t('conn.card.tagBug')}</span>`;
      if (t.includes('epic'))                            return `<span style="background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">${window.t('conn.card.tagEpic')}</span>`;
      if (t.includes('story') || t.includes('histoire')) return `<span style="background:rgba(0,212,170,0.15);color:var(--teal);border:1px solid rgba(0,212,170,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">${window.t('conn.card.tagStory')}</span>`;
      if (t.includes('task')  || t.includes('tâche') || t.includes('tache')) return `<span style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);padding:2px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">${window.t('conn.card.tagTask')}</span>`;
      return `<span class="tag jira">${escHtml(type)}</span>`;
    }

    // Render card
    const cardHtml = `
      <div class="us-card">
        <div class="us-id">🟦 ${issue.id} · ${issueTypeTag(issue.type)} · <span class="tag warn">${issue.state}</span></div>
        <div class="us-title">${escHtml(issue.title)}</div>
        ${issue.description ? `<div class="us-section"><div class="us-section-label">${t('conn.card.description')}</div><div class="us-section-content">${escHtml(issue.description)}</div></div>` : ''}
        ${issue.acceptance  ? `<div class="us-section"><div class="us-section-label">${t('conn.card.acceptance')}</div><div class="us-section-content us-acceptance">${escHtml(issue.acceptance)}</div></div>` : ''}
        ${issue.labels.length ? `<div style="font-size:11px;color:var(--gray);font-family:'IBM Plex Mono',monospace;margin-top:8px">${t('conn.card.labels')} ${issue.labels.map(l => `<span class="tag jira">${escHtml(l)}</span>`).join(' ')}</div>` : ''}
      </div>`;

    const issueCardId = 'issue-' + Date.now();
    const div = document.createElement('div');
    div.className = 'msg agent';
    div.id = issueCardId;
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="msg-bubble">
          ${t('conn.card.usRetrieved')} <strong>${issue.id}</strong> :${cardHtml}
          <div style="margin-top:12px;font-size:13px;color:#8ab4c4">
            ${t('conn.card.askGenerateCases')}
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button data-issue-card="${issueCardId}" data-action="yes"
              style="background:rgba(0,212,170,0.12);border:1px solid var(--teal);color:var(--teal);padding:8px 20px;border-radius:7px;font-size:13px;font-family:'Syne',sans-serif;font-weight:600;cursor:pointer">
              ${t('conn.card.yesGenerate')}
            </button>
            <button data-issue-card="${issueCardId}" data-action="no"
              style="background:transparent;border:1px solid var(--border);color:var(--gray);padding:8px 16px;border-radius:7px;font-size:13px;font-family:'Syne',sans-serif;cursor:pointer">
              ${t('conn.card.noThanks')}
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
    renderAgentMsg(t('conn.msg.jiraError').replace('{err}', err.message));
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
    renderAgentMsg(t('conn.msg.genError').replace('{err}', err.message));
  }
}


// ── API key helpers ───────────────────────────────────────────────────────────
function clearApiKey() {
  const el = document.getElementById('apiKey');
  el.value = '';
  el.type = 'password';
  document.getElementById('keyToggle').textContent = '👁';
  updateKeyStatus('');
  try { localStorage.removeItem('qa_agent_key'); } catch(e) {}
  el.focus();
  showToast(t('conn.apiKeyCleared'));
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
    badge.textContent = '✓ ' + (label || t('conn.connected'));
    badge.className   = 'conn-badge ' + (platform === 'jira' ? 'ok-blue' : 'ok');
    card.className    = 'conn-card ' + (platform === 'jira' ? 'connected-jira' : 'connected');
    if (btn) btn.textContent = t('conn.disconnect');
  } else {
    badge.textContent = t('conn.notConnected');
    badge.className   = 'conn-badge';
    card.className    = 'conn-card';
    if (btn) btn.textContent = t('conn.connect');
  }
}

// Bascule de langue : re-render des badges JS (hors data-i18n) avec l'ÉTAT COURANT réel
// des sessions -> retraduit "connecté/non connecté" + boutons sans repasser à "non connecté".
window.__i18nRerender = window.__i18nRerender || [];
window.__i18nRerender.push(function(){
  updateConnBadge('azure', !!azureSession, azureSession ? azureSession.org + '/' + azureSession.project : '');
  updateConnBadge('jira',  !!jiraSession,  jiraSession  ? jiraSession.host : '');
});

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
// Bouton unique : connecte si deconnecte, deconnecte si connecte.
function uiToggleAzure() {
  if (azureSession) uiDisconnectAzure();
  else              uiConnectAzure();
}

async function uiConnectAzure() {
  const url   = document.getElementById('azureUrlInput').value.trim();
  const token = document.getElementById('azureTokenInput').value.trim();
  hideConnError('azure');

  if (!url || !token) {
    showConnError('azure', t('conn.urlTokenRequired'));
    return;
  }

  const btn = document.getElementById('azureConnectLabel');
  btn.textContent = t('conn.connecting');

  try {
    const r    = await fetch(`/api/azure/connect`, {
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
    renderAgentMsg(`${t('conn.msg.azureConnectedShort')} <span class="tag azure">📁 ${data.org} / ${data.project}</span>\n\n${t('conn.msg.enterUsClickFetch').replace('{btn}', t('conn.fetch'))}`);

  } catch(err) {
    btn.textContent = t('conn.connect');
    const msg = err.message.includes('fetch') ? '❌ Serveur proxy non démarré — lance node server.js' : '❌ ' + err.message;
    showConnError('azure', msg);
  }
}

async function uiFetchAzure() {
  const id = document.getElementById('azureUsInput').value.trim();
  hideConnError('azure');
  if (!id) { showConnError('azure', t('conn.err.usNumberRequired')); return; }
  if (!azureSession) { showConnError('azure', t('conn.err.connectFirst')); return; }

  const btn = document.querySelector('#azureCard .mini-btn');
  if (btn) btn.textContent = '⏳';

  try {
    const r    = await fetch(`/api/azure/workitem/${id}`);
    const data = await r.json();
    if (!r.ok) { showConnError('azure', '❌ ' + (data.error || t('conn.err.httpError').replace('{status}', r.status))); return; }
    const apiKey = window._serverApiKey || document.getElementById('apiKey').value.trim();
    await handleFetchAndGenerate(id, false, apiKey, '', data);  // false = afficher carte + question + 2 boutons (génère au clic "Oui", comme Jira)
  } catch(err) {
    showConnError('azure', err.message.includes('fetch') ? '❌ Serveur proxy non démarré' : '❌ ' + err.message);
  } finally {
    if (btn) btn.textContent = t('conn.fetch');
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
  showToast(t('conn.azureDisconnected'));
}

// ── Jira UI ───────────────────────────────────────────────────────────────────
// Bouton unique : connecte si deconnecte, deconnecte si connecte.
function uiToggleJira() {
  if (jiraSession) uiDisconnectJira();
  else             uiConnectJira();
}

async function uiConnectJira() {
  const url   = document.getElementById('jiraUrlInput').value.trim();
  const email = document.getElementById('jiraEmailInput').value.trim();
  const token = document.getElementById('jiraTokenInput').value.trim();
  hideConnError('jira');

  if (!url || !email || !token) {
    showConnError('jira', t('conn.urlEmailTokenRequired'));
    return;
  }

  const btn = document.getElementById('jiraConnectLabel');
  btn.textContent = t('conn.connecting');

  try {
    const r    = await fetch(`/api/jira/connect`, {
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
    renderAgentMsg(`${t('conn.msg.jiraConnectedShort')} <span class="tag jira">🟦 ${host}</span>\n\n${t('conn.msg.greeting').replace('{name}', data.displayName)} ${t('conn.msg.enterIssueClickFetch').replace('{btn}', t('conn.fetch'))}`);

  } catch(err) {
    btn.textContent = t('conn.connect');
    const msg = err.message.includes('fetch') ? '❌ Serveur proxy non démarré — lance node server.js' : '❌ ' + err.message;
    showConnError('jira', msg);
  }
}

async function uiFetchJira() {
  const id = document.getElementById('jiraIssueInput').value.trim();
  hideConnError('jira');
  if (!id) { showConnError('jira', t('conn.err.issueNumberRequired')); return; }
  if (!jiraSession) { showConnError('jira', t('conn.err.connectFirst')); return; }

  const btn = document.querySelector('#jiraCard .mini-btn');
  if (btn) btn.textContent = '⏳';

  await handleJiraFetch(id, false, window._serverApiKey || document.getElementById('apiKey').value.trim());

  if (btn) btn.textContent = t('conn.fetch');
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
  showToast(t('conn.jiraDisconnected'));
}

// ── Restore on load ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  restoreConnCards();
  // Restore connection badges if sessions exist
  if (azureSession) updateConnBadge('azure', true, azureSession.org + '/' + azureSession.project);
  if (jiraSession)  updateConnBadge('jira',  true, jiraSession.host);
});
