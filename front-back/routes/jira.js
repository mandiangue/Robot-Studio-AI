const express = require('express');
const router  = express.Router();
const { apiGet } = require('../helpers');

let JIRA = { b64: null, host: null, email: null, displayName: null };

router.post('/connect', async (req, res) => {
  const { jiraUrl, email, token } = req.body;
  try {
    const { URL } = require('url');
    const host = new URL(jiraUrl.trim()).hostname;
    const b64  = Buffer.from(`${email}:${token}`).toString('base64');
    const r = await apiGet(`https://${host}/rest/api/3/myself`, { 'Authorization': `Basic ${b64}` });
    if (r.status === 401) return res.status(401).json({ error: 'Token Jira invalide' });
    if (r.status >= 400) return res.status(r.status).json({ error: `Erreur Jira HTTP ${r.status}` });
    JIRA = { b64, host, email, displayName: r.body.displayName || email };
    res.json({ success: true, host, displayName: JIRA.displayName });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/issue/:key', async (req, res) => {
  if (!JIRA.b64) return res.status(401).json({ error: 'Non connecté à Jira' });
  try {
    const r = await apiGet(
      `https://${JIRA.host}/rest/api/3/issue/${req.params.key}?fields=summary,description,issuetype,status,labels,customfield_10016`,
      { 'Authorization': `Basic ${JIRA.b64}` }
    );
    if (r.status === 404) return res.status(404).json({ error: `Issue ${req.params.key} introuvable` });
    if (r.status >= 400) return res.status(r.status).json({ error: `Erreur Jira HTTP ${r.status}` });
    const f = r.body.fields;
    const extractAdf = (adf) => {
      if (!adf) return '';
      if (typeof adf === 'string') return adf;
      const texts = [];
      const walk = (node) => { if (node.type === 'text') texts.push(node.text); if (node.content) node.content.forEach(walk); };
      walk(adf);
      return texts.join(' ');
    };
    res.json({
      id:          req.params.key,
      title:       f.summary,
      description: extractAdf(f.description),
      acceptance:  extractAdf(f.customfield_10016),
      state:       f.status?.name || '',
      type:        f.issuetype?.name || 'Story',
      labels:      f.labels || [],
      url:         `https://${JIRA.host}/browse/${req.params.key}`,
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/status', (req, res) => {
  res.json(JIRA.b64 ? { connected: true, host: JIRA.host, displayName: JIRA.displayName } : { connected: false });
});

module.exports = router;
