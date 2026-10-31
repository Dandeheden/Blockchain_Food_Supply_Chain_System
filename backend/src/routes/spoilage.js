const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Batch = require('../models/Batch');
const SpoilageReport = require('../models/SpoilageReport');
const { protect, authorize } = require('../middleware/auth');
const { reportSpoilageOnChain } = require('../services/blockchain');

// POST /api/spoilage — report spoilage
router.post('/', protect, [
  body('batchId').trim().notEmpty().withMessage('batchId is required'),
  body('stage').isIn(['Farmer', 'Processor', 'Distributor', 'Retailer', 'Customer']).withMessage('Invalid stage'),
  body('condition').trim().notEmpty().withMessage('Condition description is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { batchId, stage, condition, temperature, description, severity } = req.body;

    const batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found.' });

    const report = await SpoilageReport.create({
      batch: batch._id, batchId, reportedBy: req.user._id,
      stage, condition, temperature, description,
      severity: severity || 'Medium',
    });

    // Mark batch as spoiled
    batch.status = 'Spoilage Reported';
    await batch.save();

    // Submit to blockchain
    const notes = `${condition}. ${description}. Temp: ${temperature}°C`;
    const txResult = await reportSpoilageOnChain(batchId, stage, notes);
    if (txResult) {
      report.txHash = txResult.txHash;
      report.blockNumber = txResult.blockNumber;
      await report.save();
    }

    res.status(201).json({ success: true, report, blockchain: txResult });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/spoilage — list all spoilage reports (admin/regulator)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const reports = await SpoilageReport.find()
      .populate('batch', 'productName batchId category')
      .populate('reportedBy', 'name role organization')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/spoilage/:batchId
router.get('/:batchId', protect, async (req, res) => {
  try {
    const reports = await SpoilageReport.find({ batchId: req.params.batchId })
      .populate('reportedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/spoilage/:id/investigate — admin updates investigation status
router.patch('/:id/investigate', protect, authorize('admin'), [
  body('investigationStatus').isIn(['Pending', 'Under Investigation', 'Resolved', 'Closed']),
  body('adminNotes').optional().trim(),
], async (req, res) => {
  try {
    const report = await SpoilageReport.findByIdAndUpdate(
      req.params.id,
      { investigationStatus: req.body.investigationStatus, adminNotes: req.body.adminNotes },
      { new: true }
    ).populate('batch', 'productName batchId').populate('reportedBy', 'name role');

    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
