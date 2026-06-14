const express  = require('express');
const router   = express.Router();
const CodeCard    = require('../models/CodeCard');
const Report      = require('../models/Report');
const SuiteReport = require('../models/SuiteReport');
const TCStore     = require('../models/TCStore');
const Suites      = require('../models/Suites');

// ── GET /api/storage/all — charge toutes les données au démarrage ─────────────
router.get('/all', async (req, res) => {
  try {
    const [codeCards, reports, suiteReports] = await Promise.all([
      CodeCard.find().lean(),
      Report.find().lean(),
      SuiteReport.find().lean(),
    ]);
    // Reconstruit le format _codeCards attendu par le front
    const cards = [
      ...codeCards.map(c => ({ type: c.type||'multi', cardId: c.cardId, title: c.title, files: c.files||[] })),
      ...reports.map(r => {
        // Exclure les screenshots pour reduire la taille de la reponse
        const dataLight = r.data ? {
          ...r.data,
          tests: (r.data.tests||[]).map(t => ({
            ...t,
            screenshot: undefined,
            steps: (t.steps||[]).map(s => ({ ...s, screenshot: undefined }))
          }))
        } : r.data;
        return { type: 'report', cardId: r.cardId, suiteCardId: r.suiteCardId||null, data: dataLight };
      }),
      ...suiteReports.map(s => ({ type: 'suite-report', cardId: s.cardId, suiteTitle: s.suiteTitle, total: s.total, passed: s.passed, failed: s.failed, rate: s.rate, blockNames: s.blockNames||[], blocs: s.blocs||[], tests: s.tests||[], data: s.data, createdAt: s.createdAt })),
    ];
    res.json({ ok: true, cards });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── GET /api/storage/report/:cardId — details complets avec screenshots ──────
router.get('/report/:cardId', async (req, res) => {
  try {
    const report = await Report.findOne({ cardId: req.params.cardId }).lean();
    if (!report) return res.status(404).json({ ok: false, error: 'Report not found' });
    res.json({ ok: true, data: report.data });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── POST /api/storage/save — sauvegarde un tableau de cards ──────────────────
router.post('/save', async (req, res) => {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards)) return res.status(400).json({ ok: false, error: 'cards must be array' });

    for (const card of cards) {
      if (!card.cardId) continue;

      if (card.type === 'multi' || card.type === 'single') {
        await CodeCard.findOneAndUpdate(
          { cardId: card.cardId },
          { cardId: card.cardId, type: card.type, title: card.title, files: card.files||[] },
          { upsert: true, returnDocument: 'after' }
        );
      } else if (card.type === 'report') {
        await Report.findOneAndUpdate(
          { cardId: card.cardId },
          { cardId: card.cardId, suiteCardId: card.suiteCardId||null, data: card.data },
          { upsert: true, returnDocument: 'after' }
        );
      } else if (card.type === 'suite-report') {
        await SuiteReport.findOneAndUpdate(
          { cardId: card.cardId },
          { cardId: card.cardId, suiteTitle: card.suiteTitle, total: card.total, passed: card.passed, failed: card.failed, rate: card.rate, blockNames: card.blockNames||[], blocs: card.blocs||[], tests: card.tests||[], data: card.data },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── DELETE /api/storage/card/:cardId ─────────────────────────────────────────
router.delete('/card/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    await Promise.all([
      CodeCard.deleteOne({ cardId }),
      Report.deleteOne({ cardId }),
      SuiteReport.deleteOne({ cardId }),
      // Supprimer aussi le suite-report lié
      Report.deleteMany({ suiteCardId: cardId }),
    ]);
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


// POST /api/storage/tcstore
router.post('/tcstore', async (req, res) => {
  try {
    const { store } = req.body;
    await TCStore.findOneAndUpdate(
      { storeId: 'main' },
      { store, updatedAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/storage/tcstore
router.get('/tcstore', async (req, res) => {
  try {
    const doc = await TCStore.findOne({ storeId: 'main' }).lean();
    res.json({ ok: true, store: doc?.store || {} });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});


// POST /api/storage/suites
router.post('/suites', async (req, res) => {
  try {
    const { savedSuites, registry } = req.body;
    await Suites.findOneAndUpdate(
      { storeId: 'main' },
      { savedSuites, registry, updatedAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/storage/suites
router.get('/suites', async (req, res) => {
  try {
    const doc = await Suites.findOne({ storeId: 'main' }).lean();
    res.json({ ok: true, savedSuites: doc?.savedSuites || [], registry: doc?.registry || [] });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ── DELETE /api/storage/clear — vide toutes les collections ─────────────────
router.delete('/clear', async (req, res) => {
  try {
    await Promise.all([
      CodeCard.deleteMany({}),
      Report.deleteMany({}),
      SuiteReport.deleteMany({}),
      TCStore.deleteMany({}),
      Suites.deleteMany({}),
    ]);
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
