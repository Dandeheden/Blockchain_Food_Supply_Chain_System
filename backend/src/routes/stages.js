const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Batch = require('../models/Batch');
const StageUpdate = require('../models/StageUpdate');
const { protect, authorize } = require('../middleware/auth');
const { updateStageOnChain, hashData } = require('../services/blockchain');

const STAGE_ORDER = ['Farmer', 'Processor', 'Distributor', 'Retailer', 'Delivered'];

// POST /api/stages — add a new supply-chain stage update
router.post('/', protect, authorize('processor', 'distributor', 'retailer', 'admin', 'farmer'), [
  body('batchId').trim().notEmpty().withMessage('batchId is required'),
  body('stage').isIn(['Processor', 'Distributor', 'Retailer', 'Delivered']).withMessage('Invalid stage'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('condition').isIn(['Good', 'Warning', 'Spoiled']).withMessage('Condition must be Good, Warning, or Spoiled'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { batchId, stage, location, condition, temperature, humidity, notes, oracleData } = req.body;

    const batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found.' });
    if (batch.status === 'Spoilage Reported') {
      return res.status(400).json({ success: false, message: 'Cannot update a spoilage-reported batch.' });
    }

    // Validate stage progression
    const currentIdx = STAGE_ORDER.indexOf(batch.currentStage);
    const newIdx = STAGE_ORDER.indexOf(stage);
    if (newIdx <= currentIdx) {
      return res.status(400).json({
        success: false,
        message: `Cannot move batch backwards. Current stage: ${batch.currentStage}.`,
      });
    }

    // Check temperature warning
    let computedCondition = condition;
    if (temperature !== undefined) {
      if (temperature > batch.safeTemperatureMax || temperature < batch.safeTemperatureMin) {
        computedCondition = computedCondition === 'Good' ? 'Warning' : computedCondition;
      }
    }

    const stageData = { batchId, stage, location, condition: computedCondition, temperature, humidity, notes };
    const dataHash = hashData(stageData);

    // Save to DB
    const update = await StageUpdate.create({
      batch: batch._id, batchId, stage,
      participant: req.user._id, location,
      condition: computedCondition, temperature, humidity, notes,
      oracleData: oracleData || { isSimulated: true },
      dataHash,
    });

    // Update batch status
    batch.currentStage = stage;
    if (computedCondition === 'Warning' && batch.status === 'Normal') batch.status = 'Warning';
    await batch.save();

    // Submit to blockchain (best-effort)
    const txResult = await updateStageOnChain(batchId, stageData);
    if (txResult) {
      update.txHash = txResult.txHash;
      update.blockNumber = txResult.blockNumber;
      await update.save();
    }

    const populated = await StageUpdate.findById(update._id)
      .populate('participant', 'name email role organization');

    res.status(201).json({ success: true, update: populated, blockchain: txResult });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/stages/:batchId — get all stage updates for a batch
router.get('/:batchId', protect, async (req, res) => {
  try {
    const stages = await StageUpdate.find({ batchId: req.params.batchId })
      .populate('participant', 'name email role organization')
      .sort({ timestamp: 1 });
    res.json({ success: true, stages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
