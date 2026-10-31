const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { protect } = require('../middleware/auth');
const Batch = require('../models/Batch');

// GET /api/qrcode/:batchId — generate QR code image (PNG as base64)
router.get('/:batchId', protect, async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found.' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${frontendUrl}/public/batch/${req.params.batchId}`;

    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: { dark: '#14532d', light: '#ffffff' },
    });

    res.json({ success: true, batchId: req.params.batchId, url, qrDataUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/qrcode/:batchId/image — serve raw PNG image
router.get('/:batchId/image', async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${frontendUrl}/public/batch/${req.params.batchId}`;

    res.setHeader('Content-Type', 'image/png');
    await QRCode.toFileStream(res, url, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: { dark: '#14532d', light: '#ffffff' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
