// ============================================================================
// connectors.js — Azure & Jira (connexion/fetch/génération)
// ============================================================================

// ── API key ──────────────────────────────────────────────────────────────

function updateKeyStatus(val) {
  const el = document.getElementById('keyStatus');
  const provider = getCurrentProvider();
  const minLen = { anthropic: 20, openai: 20, gemini: 10, mistral: 10 };
  const ok = val && val.length >= (minLen[provider] || 10);
  el.textContent = ok ? '⬤ ready' : '⬤ no key';
  el.className   = 'key-status' + (ok ? ' ok' : '');
}

// ── Azure connect ─────────────────────────────────────────────────────────

function parseAzureUrl(url) {
  const parsed = new URL(url.trim());
  const parts  = parsed.pathname.replace(/^\//, '').split('/').filter(Boolean);
  let org, project;
  if (parsed.hostname === 'dev.azure.com') {
    org = parts[0];
    project = parts[1];
  } else {
    org = parsed.hostname.split('.')[0];
    project = parts[0];
  }
  return { org, project };
}

async function azureFetch(path, token) {
  const b64 = btoa(`:${token}`);
  return fetch(path, {
    headers: {
      'Authorization': `Basic ${b64}`,
      'Accept': 'application/json'
    }
  });
}

async function handleAzureConnect(url, token) {
  showTyping();
  try {
    const { org, project } = parseAzureUrl(url);

    if (!org || !project) {
      hideTyping();
      renderAgentMsg('❌ URL invalide. Format : https://dev.azure.com/org/projet');
      return;
    }

    // ✅ endpoint correct
    const testUrl = `https://dev.azure.com/${org}/_apis/projects?api-version=7.0`;

    const r = await azureFetch(testUrl, token);
    const data = await r.json();

    hideTyping();

    if (r.status === 401) {
      renderAgentMsg('❌ Token invalide ou accès refusé.');
      return;
    }

    if (!r.ok) {
      renderAgentMsg(`❌ Erreur Azure DevOps : HTTP ${r.status}`);
      return;
    }

    // ✅ vérification projet réelle
    const exists = data.value?.some(p => p.name === project);

    if (!exists) {
      renderAgentMsg(`❌ Projet "${project}" introuvable dans "${org}".`);
      return;
    }

    azureSession = { org, project, token };
    LS.save();

    renderAgentMsg(`✅ Connecté à Azure DevOps !

📁 ${org} / 🗂 ${project}

Quel numéro d'US veux-tu récupérer ?`);

  } catch (err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur Azure : ${err.message}`);
  }
}

// ── Fetch Azure US ────────────────────────────────────────────────────────

async function handleFetchAndGenerate(id, shouldGenerate, apiKey) {
  showTyping();

  try {
    const { org, project, token } = azureSession;

    const fields = [
      'System.Id',
      'System.Title',
      'System.Description',
      'System.WorkItemType',
      'System.State',
      'Microsoft.VSTS.Common.AcceptanceCriteria',
      'System.Tags'
    ].join(',');

    // ✅ FIX &api-version
    const url = `https://dev.azure.com/${org}/${project}/_apis/wit/workitems/${id}?fields=${fields}&api-version=7.0`;

    const r = await azureFetch(url, token);
    const data = await r.json();

    hideTyping();

    if (!r.ok) {
      renderAgentMsg(`❌ Work Item #${id} introuvable : ${data.message || r.status}`);
      return;
    }

    const f = data.fields;

    const us = {
      id: data.id,
      type: f['System.WorkItemType'],
      title: f['System.Title'],
      description: f['System.Description'] || '',
      acceptance: f['Microsoft.VSTS.Common.AcceptanceCriteria'] || '',
      state: f['System.State'],
      tags: f['System.Tags'] || ''
    };

    const cardHtml = renderUsCard(us);

    const div = document.createElement('div');
    div.className = 'msg agent';
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="msg-bubble">
          J'ai récupéré l'US #${id} :
          ${cardHtml}
        </div>
      </div>`;

    document.getElementById('messages').appendChild(div);
    scrollToBottom();

    if (shouldGenerate) {
      await generateTestCasesFromIssue(us, apiKey);
    }

  } catch (err) {
    hideTyping();
    renderAgentMsg(`❌ Erreur : ${err.message}`);
  }
}

// ── Azure UI ─────────────────────────────────────────────────────────────

async function uiConnectAzure() {
  const url   = document.getElementById('azureUrlInput').value.trim();
  const token = document.getElementById('azureTokenInput').value.trim();

  if (!url || !token) {
    showConnError('azure', '⚠️ URL et token requis');
    return;
  }

  handleAzureConnect(url, token);
}

async function uiFetchAzure() {
  const id = document.getElementById('azureUsInput').value.trim();

  if (!id) {
    showConnError('azure', '⚠️ Saisis un numéro d\'US');
    return;
  }

  if (!azureSession) {
    showConnError('azure', '⚠️ Connecte-toi d\'abord');
    return;
  }

  const apiKey = document.getElementById('apiKey').value.trim();

  await handleFetchAndGenerate(id, true, apiKey);
}

function uiDisconnectAzure() {
  azureSession = null;
  updateConnBadge('azure', false);
  showToast('Azure déconnecté');
}
