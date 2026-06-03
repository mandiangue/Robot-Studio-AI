const mongoose = require('mongoose');

const SuiteReportSchema = new mongoose.Schema({
  cardId:     { type: String, required: true, unique: true },
  suiteTitle: String,
  total:      Number,
  passed:     Number,
  failed:     Number,
  rate:       Number,
  blockNames: [String],
  blocs:      mongoose.Schema.Types.Mixed,
  tests:      mongoose.Schema.Types.Mixed,
  data:       mongoose.Schema.Types.Mixed,
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('SuiteReport', SuiteReportSchema);
