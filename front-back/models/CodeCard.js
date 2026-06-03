const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: String,
  code:     String,
  label:    String,
  desc:     String,
}, { _id: false });

const CodeCardSchema = new mongoose.Schema({
  cardId:   { type: String, required: true, unique: true },
  type:     { type: String, enum: ['multi', 'single'], default: 'multi' },
  title:    String,
  files:    [FileSchema],
  createdAt:{ type: Date, default: Date.now },
});

module.exports = mongoose.model('CodeCard', CodeCardSchema);
