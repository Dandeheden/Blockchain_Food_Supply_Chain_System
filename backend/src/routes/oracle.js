const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSimulatedReading, listSensors } = require('../services/oracle');

// GET /api/oracle/sensors — list available simulated sensors
router.get('/sensors', protect, (req, res) => {
  const sensors = listSensors();
  res.json({
    success: true,
    warning: 'These are SIMULATED sensors. In a real deployment, verified IoT sensor data would be provided by a trusted oracle (e.g., Chainlink) and written directly to the blockchain. Self-reported data cannot be independently verified.',
    sensors,
  });
});

// POST /api/oracle/reading — get a simulated sensor reading
router.post('/reading', protect, (req, res) => {
  const { sensorId, temperature } = req.body;
  const reading = getSimulatedReading(sensorId, temperature);
  res.json({ success: true, reading });
});

module.exports = router;
