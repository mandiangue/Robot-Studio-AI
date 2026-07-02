const mongoose = require('mongoose');

const TokenUsageSchema = new mongoose.Schema({
  provider:     { type: String, index: true },   // anthropic|openai|gemini|mistral
  model:        { type: String, index: true },
  inputTokens:  Number,
  outputTokens: Number,
  totalTokens:  Number,
  cost:         Number,        // USD estimé
  estimated:    Boolean,       // true = prix fallback (modèle hors table)
  createdAt:    { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('TokenUsage', TokenUsageSchema);
