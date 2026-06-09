// routes/pulledblocks.js
// Routes CRUD pour la collection PulledBlock
const express  = require('express');
const router   = express.Router();
const PulledBlock = require('../models/PulledBlock');

// GET /api/pulledblocks — liste tous les blocs
router.get('/', async (req, res) => {
  try {
    const blocks = await PulledBlock.find().sort({ updatedAt: -1 });
    res.json({ ok: true, blocks });
  } catch(e) {
    res.json({ ok: false, error: e.message });
  }
});

// GET /api/pulledblocks/tagged — liste les blocs tagués uniquement
router.get('/tagged', async (req, res) => {
  try {
    const blocks = await PulledBlock.find({ tagged: true }).sort({ updatedAt: -1 });
    res.json({ ok: true, blocks });
  } catch(e) {
    res.json({ ok: false, error: e.message });
  }
});

// POST /api/pulledblocks — créer ou mettre à jour un bloc (upsert par blockId)
router.post('/', async (req, res) => {
  try {
    const { blockId, source, provider, branch, folder, files, tagged } = req.body;
    if (!blockId || !files || !files.length)
      return res.status(400).json({ ok: false, error: 'blockId et files requis' });

    const block = await PulledBlock.findOneAndUpdate(
      { blockId },
      { blockId, source, provider, branch, folder, files, tagged: tagged || false, updatedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ ok: true, block });
  } catch(e) {
    res.json({ ok: false, error: e.message });
  }
});

// PATCH /api/pulledblocks/:blockId — mise à jour partielle (ex: tagged, files modifiés)
router.patch('/:blockId', async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    const block = await PulledBlock.findOneAndUpdate(
      { blockId: req.params.blockId },
      update,
      { new: true }
    );
    if (!block) return res.json({ ok: false, error: 'Bloc introuvable' });
    res.json({ ok: true, block });
  } catch(e) {
    res.json({ ok: false, error: e.message });
  }
});

// DELETE /api/pulledblocks/:blockId — supprimer un bloc
router.delete('/:blockId', async (req, res) => {
  try {
    await PulledBlock.deleteOne({ blockId: req.params.blockId });
    res.json({ ok: true });
  } catch(e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
