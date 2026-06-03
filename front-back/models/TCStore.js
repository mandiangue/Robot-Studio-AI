const mongoose = require('mongoose');

const TCStoreSchema = new mongoose.Schema({
  storeId:  { type: String, default: 'main', unique: true },
  store:    mongoose.Schema.Types.Mixed,
  updatedAt:{ type: Date, default: Date.now },
});

module.exports = mongoose.model('TCStore', TCStoreSchema);
