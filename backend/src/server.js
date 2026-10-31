require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/batches',  require('./routes/batches'));
app.use('/api/stages',   require('./routes/stages'));
app.use('/api/spoilage', require('./routes/spoilage'));
app.use('/api/qrcode',   require('./routes/qrcode'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/oracle',   require('./routes/oracle'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Food Traceability API is running.', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Blockchain:  ${process.env.CONTRACT_ADDRESS ? 'Enabled (' + process.env.CONTRACT_ADDRESS + ')' : 'Disabled (no CONTRACT_ADDRESS in .env)'}\n`);
});
