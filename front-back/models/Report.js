const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  name:     String,
  status:   String,
  duration: Number,
  message:  String,
  lib:      String,
  screenshot: String,
}, { _id: false });

const TestSchema = new mongoose.Schema({
  name:            String,
  status:          String,
  duration:        Number,
  message:         String,
  tags:            [String],
  steps:           [StepSchema],
  failureAnalysis: String,
  suggestion:      String,
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  cardId:     { type: String, required: true, unique: true },
  suiteCardId:String,
  data: {
    runNumber:  Number,
    runDate:    String,
    runType:    String,
    pageTitle:  String,
    suiteName:  String,
    isSuite:    Boolean,
    blockNames: [String],
    status:     String,
    total:      Number,
    passed:     Number,
    failed:     Number,
    duration:   Number,
    environment:String,
    reportTitle:String,
    comment:    String,
    tests:      [TestSchema],
    logUrl:     String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', ReportSchema);
