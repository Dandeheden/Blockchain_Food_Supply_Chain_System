const mongoose = require('mongoose');

const stageUpdateSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  batchId: {
    type: String,
    required: true,
  },
  stage: {
    type: String,
    enum: ['Farmer', 'Processor', 'Distributor', 'Retailer', 'Delivered'],
    required: true,
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    enum: ['Good', 'Warning', 'Spoiled'],
    default: 'Good',
  },
  temperature: {
    type: Number, // in Celsius
  },
  humidity: {
    type: Number, // percentage
  },
  notes: {
    type: String,
    trim: true,
  },
  // Simulated oracle data
  oracleData: {
    isSimulated: { type: Boolean, default: true },
    sensorId: { type: String },
    rawData: { type: Object },
  },
  // Blockchain info
  txHash: {
    type: String,
  },
  blockNumber: {
    type: Number,
  },
  dataHash: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('StageUpdate', stageUpdateSchema);
