const mongoose = require('mongoose');

const SuitesSchema = new mongoose.Schema({
  storeId:      { type: String, default: 'main', unique: true },
  savedSuites:  mongoose.Schema.Types.Mixed,
  registry:     mongoose.Schema.Types.Mixed,
  updatedAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Suites', SuitesSchema);
