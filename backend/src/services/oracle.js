/**
 * Oracle Simulation Service
 *
 * NOTE: This is a SIMULATED oracle. In a real system you would use Chainlink or
 * a trusted third-party oracle to bring verified IoT sensor data onto the blockchain.
 * All data submitted here is self-reported or manually entered and should not be
 * treated as independently verified.
 */
const crypto = require('crypto');

// Simulated sensor registry
const SIMULATED_SENSORS = {
  'SENSOR-001': { location: 'Mumbai Cold Storage', type: 'temperature-humidity', unit: 'Celsius' },
  'SENSOR-002': { location: 'Pune Warehouse',       type: 'temperature-humidity', unit: 'Celsius' },
  'SENSOR-003': { location: 'Delhi Distribution',   type: 'temperature-humidity', unit: 'Celsius' },
  'SENSOR-004': { location: 'Agra Transit Vehicle', type: 'temperature-humidity', unit: 'Celsius' },
};

/**
 * Generate a simulated sensor reading.
 * In production: fetch from actual IoT endpoint.
 */
const getSimulatedReading = (sensorId, manualTemperature) => {
  const sensor = SIMULATED_SENSORS[sensorId] || { location: 'Unknown', type: 'manual' };
  const temperature = manualTemperature !== undefined ? manualTemperature : (20 + Math.random() * 10 - 2);
  const humidity = Math.round(40 + Math.random() * 40);
  const readingId = crypto.randomBytes(8).toString('hex');

  return {
    isSimulated: true,
    sensorId: sensorId || 'MANUAL-INPUT',
    readingId,
    location: sensor.location,
    temperature: parseFloat(temperature.toFixed(1)),
    humidity,
    timestamp: new Date().toISOString(),
    warning: 'This data is SIMULATED. In production, a real oracle (e.g., Chainlink) would be required to trustlessly bring sensor data onto the blockchain.',
  };
};

/**
 * List available simulated sensors.
 */
const listSensors = () => {
  return Object.entries(SIMULATED_SENSORS).map(([id, info]) => ({ id, ...info }));
};

module.exports = { getSimulatedReading, listSensors };
