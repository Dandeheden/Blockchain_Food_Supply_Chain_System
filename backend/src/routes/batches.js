const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Batch = require('../models/Batch');
const StageUpdate = require('../models/StageUpdate');
const SpoilageReport = require('../models/SpoilageReport');
const { protect, authorize } = require('../middleware/auth');
const { registerBatchOnChain, getOnChainBatch, getOnChainHistory, hashData } = require('../services/blockchain');

// GET /api/batches — list all batches (protected)
router.get('/', protect, async (req, res) => {
  try {
    const { status, stage, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (stage) query.currentStage = stage;
    if (search) query.$or = [
      { batchId: { $regex: search, $options: 'i' } },
      { productName: { $regex: search, $options: 'i' } },
    ];

    // Farmers see only their own batches
    if (req.user.role === 'farmer') query.farmer = req.user._id;

    const batches = await Batch.find(query)
      .populate('farmer', 'name email organization location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: batches.length, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/batches/stats — dashboard statistics (protected)
router.get('/stats', protect, async (req, res) => {
  try {
    const [total, inTransit, delivered, spoiled] = await Promise.all([
      Batch.countDocuments(),
      Batch.countDocuments({ currentStage: { $in: ['Processor', 'Distributor', 'Retailer'] } }),
      Batch.countDocuments({ currentStage: 'Delivered' }),
      Batch.countDocuments({ status: 'Spoilage Reported' }),
    ]);

    const recentActivity = await StageUpdate.find()
      .populate('batch', 'productName batchId')
      .populate('participant', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, stats: { total, inTransit, delivered, spoiled }, recentActivity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/batches/public/:batchId — public route for QR code pages
router.get('/public/:batchId', async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId })
      .populate('farmer', 'name organization location');

    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found.' });

    const stages = await StageUpdate.find({ batchId: req.params.batchId })
      .populate('participant', 'name role organization')
      .sort({ timestamp: 1 });

    const spoilageReports = await SpoilageReport.find({ batchId: req.params.batchId })
      .select('-reportedBy'); // don't expose user IDs publicly

    res.json({ success: true, batch, stages, spoilageReports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/batches/:batchId — full detail (protected)
router.get('/:batchId', protect, async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId })
      .populate('farmer', 'name email organization location walletAddress');

    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found.' });

    const stages = await StageUpdate.find({ batchId: req.params.batchId })
      .populate('participant', 'name email role organization walletAddress')
      .sort({ timestamp: 1 });

    const spoilageReports = await SpoilageReport.find({ batchId: req.params.batchId })
      .populate('reportedBy', 'name email role');

    // Try to get blockchain data
    const [onChainBatch, onChainHistory] = await Promise.all([
      getOnChainBatch(req.params.batchId),
      getOnChainHistory(req.params.batchId),
    ]);

    res.json({ success: true, batch, stages, spoilageReports, blockchain: { batch: onChainBatch, history: onChainHistory } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/batches — register new batch (farmer only)
router.post('/', protect, authorize('farmer', 'admin'), [
  body('productName').trim().notEmpty().withMessage('Product name required'),
  body('category').isIn(['vegetables', 'fruits', 'grains', 'dairy', 'meat', 'seafood', 'other']).withMessage('Invalid category'),
  body('quantity').isNumeric({ no_symbols: true }).withMessage('Quantity must be a number'),
  body('farmLocation').trim().notEmpty().withMessage('Farm location required'),
  body('harvestDate').isISO8601().withMessage('Valid harvest date required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const {
      productName, category, quantity, unit, farmLocation, harvestDate,
      description, safeTemperatureMin, safeTemperatureMax,
    } = req.body;

    const batchId = `BATCH-${productName.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const batchData = { batchId, productName, category, quantity, farmLocation, harvestDate };
    const dataHash = hashData(batchData);

    const batch = await Batch.create({
      batchId, productName, category,
      quantity: Number(quantity), unit: unit || 'kg',
      farmLocation, harvestDate, description,
      farmer: req.user._id,
      safeTemperatureMin: safeTemperatureMin || 0,
      safeTemperatureMax: safeTemperatureMax || 25,
      dataHash,
    });

    // Record initial stage in DB
    await StageUpdate.create({
      batch: batch._id, batchId,
      stage: 'Farmer', participant: req.user._id,
      location: farmLocation, condition: 'Good',
      notes: 'Batch registered at farm.',
      dataHash,
    });

    // Submit to blockchain (best-effort)
    const txResult = await registerBatchOnChain(batchId, batchData);
    if (txResult) {
      batch.contractTxHash = txResult.txHash;
      batch.contractBlockNumber = txResult.blockNumber;
      await batch.save();
    }

    const populated = await Batch.findById(batch._id).populate('farmer', 'name email organization');
    res.status(201).json({ success: true, batch: populated, blockchain: txResult });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
