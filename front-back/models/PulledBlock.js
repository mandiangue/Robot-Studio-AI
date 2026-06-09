const mongoose = require('mongoose');

const PulledFileSchema = new mongoose.Schema({
  filename: String,
  code:     String,
  label:    String,
}, { _id: false });

const PulledBlockSchema = new mongoose.Schema({
  blockId:   { type: String, required: true, unique: true },
  source:    { type: String, required: true }, // ex: 'gitlab - main', 'Jenkins #42'
  provider:  { type: String, enum: ['gitlab', 'azure', 'jenkins'], default: 'gitlab' },
  branch:    String,
  folder:    String,
  files:     [PulledFileSchema],
  tagged:    { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PulledBlockSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PulledBlock', PulledBlockSchema);
