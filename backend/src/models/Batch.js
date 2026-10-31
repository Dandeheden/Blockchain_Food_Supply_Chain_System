const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const batchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    unique: true,
    default: () => `BATCH-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`,
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'meat', 'seafood', 'other'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    default: 'kg',
  },
  farmLocation: {
    type: String,
    required: true,
  },
  harvestDate: {
    type: Date,
    required: true,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentStage: {
    type: String,
    enum: ['Farmer', 'Processor', 'Distributor', 'Retailer', 'Delivered'],
    default: 'Farmer',
  },
  status: {
    type: String,
    enum: ['Normal', 'Warning', 'Spoilage Reported'],
    default: 'Normal',
  },
  description: {
    type: String,
    trim: true,
  },
  safeTemperatureMin: {
    type: Number,
    default: 0,
  },
  safeTemperatureMax: {
    type: Number,
    default: 25,
  },
  // Blockchain info
  contractTxHash: {
    type: String,
  },
  contractBlockNumber: {
    type: Number,
  },
  dataHash: {
    type: String, // keccak256 of batch JSON stored on-chain
  },
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
