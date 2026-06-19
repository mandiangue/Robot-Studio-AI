const express = require('express');
const router  = express.Router();
const { apiGet } = require('../helpers');

let AZURE = { token: null, org: null, project: null };

router.post('/connect', async (req, res) => {
  const { azureUrl, token } = req.body;
  try {
    const { URL } = require('url');
    const parsed = new URL(azureUrl.trim());
    const parts  = parsed.pathname.replace(/^\//, '').split('/').filter(Boolean);
    let org, project;
    if (parsed.hostname === 'dev.azure.com') { org = parts[0]; project = parts[1]; }
    else { org = parsed.hostname.split('.')[0]; project = parts[0]; }
    if (!org || !project) return res.status(400).json({ error: 'URL invalide' });
    const b64 = Buffer.from(`:${token}`).toString('base64');
    const r = await apiGet(
      `https://dev.azure.com/${org}/${project}/_apis/wit/workitems?$top=1&api-version=7.0`,
      { 'Authorization': `Basic ${b64}` }
    );
    if (r.status === 401) return res.status(401).json({ error: 'Token invalide' });
    if (r.status === 404) return res.status(404).json({ error: `Projet "${project}" introuvable` });
    if (r.status >= 400) return res.status(r.status).json({ error: `Erreur Azure HTTP ${r.status}` });
    AZURE = { token, org, project };
    res.json({ success: true, org, project });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/workitem/:id', async (req, res) => {
  if (!AZURE.token) return res.status(401).json({ error: 'Non connecté à Azure' });
  try {
    const fields = 'System.Id,System.Title,System.Description,System.WorkItemType,System.State,Microsoft.VSTS.Common.AcceptanceCriteria,System.Tags';
    const b64 = Buffer.from(`:${AZURE.token}`).toString('base64');
    const r = await apiGet(
      `https://dev.azure.com/${AZURE.org}/${AZURE.project}/_apis/wit/workitems/${req.params.id}?fields=${fields}&api-version=7.0`,
      { 'Authorization': `Basic ${b64}` }
    );
    if (!r.body?.fields) return res.status(404).json({ error: `Work Item #${req.params.id} introuvable` });
    const f = r.body.fields;
    res.json({ id: r.body.id, type: f['System.WorkItemType'], title: f['System.Title'], description: f['System.Description']||'', acceptance: f['Microsoft.VSTS.Common.AcceptanceCriteria']||'', state: f['System.State'], tags: f['System.Tags']||'' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/status', (req, res) => {
  res.json(AZURE.token ? { connected: true, org: AZURE.org, project: AZURE.project } : { connected: false });
});

module.exports = router;
