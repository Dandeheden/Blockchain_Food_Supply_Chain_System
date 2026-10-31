const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Batch = require('../models/Batch');
const SpoilageReport = require('../models/SpoilageReport');
const StageUpdate = require('../models/StageUpdate');
const { protect, authorize } = require('../middleware/auth');

// GET /api/admin/users — list all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/users/:id — toggle active status
router.patch('/users/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/overview — full dashboard stats
router.get('/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalBatches, totalUsers, spoilageCount,
      batchesByCategory, batchesByStatus, batchesByStage,
      recentSpoilage,
    ] = await Promise.all([
      Batch.countDocuments(),
      User.countDocuments(),
      SpoilageReport.countDocuments(),
      Batch.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Batch.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Batch.aggregate([{ $group: { _id: '$currentStage', count: { $sum: 1 } } }]),
      SpoilageReport.find({ investigationStatus: { $in: ['Pending', 'Under Investigation'] } })
        .populate('batch', 'productName batchId')
        .populate('reportedBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      overview: {
        totalBatches, totalUsers, spoilageCount,
        batchesByCategory, batchesByStatus, batchesByStage,
        recentSpoilage,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/suspicious — batches with Warning or Spoilage status
router.get('/suspicious', protect, authorize('admin'), async (req, res) => {
  try {
    const batches = await Batch.find({ status: { $in: ['Warning', 'Spoilage Reported'] } })
      .populate('farmer', 'name organization')
      .sort({ updatedAt: -1 });
    res.json({ success: true, count: batches.length, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
