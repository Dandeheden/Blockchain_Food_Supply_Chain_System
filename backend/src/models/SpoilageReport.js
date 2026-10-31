const mongoose = require('mongoose');

const spoilageReportSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  batchId: {
    type: String,
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stage: {
    type: String,
    enum: ['Farmer', 'Processor', 'Distributor', 'Retailer', 'Customer'],
    required: true,
  },
  condition: {
    type: String,
    required: true,
    trim: true,
  },
  temperature: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  // Blockchain info
  txHash: {
    type: String,
  },
  blockNumber: {
    type: Number,
  },
  investigationStatus: {
    type: String,
    enum: ['Pending', 'Under Investigation', 'Resolved', 'Closed'],
    default: 'Pending',
  },
  adminNotes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('SpoilageReport', spoilageReportSchema);
