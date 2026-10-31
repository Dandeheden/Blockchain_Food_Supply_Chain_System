/**
 * Database seed script for demo purposes.
 * Run with: node backend/scripts/seedDb.js
 *
 * Creates demo users and two batches:
 * 1. Tomatoes (spoilage demo)
 * 2. Rice (healthy journey demo)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

// Load models
const User       = require('../src/models/User');
const Batch      = require('../src/models/Batch');
const StageUpdate= require('../src/models/StageUpdate');
const SpoilageReport = require('../src/models/SpoilageReport');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_traceability';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  // Wipe existing demo data
  await Promise.all([
    User.deleteMany({}),
    Batch.deleteMany({}),
    StageUpdate.deleteMany({}),
    SpoilageReport.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  // Create users
  const [farmer, processor, distributor, retailer, admin] = await User.create([
    { name: 'Ravi Kumar', email: 'farmer@demo.com', password: 'demo123', role: 'farmer', organization: 'Green Acres Farm', location: 'Nashik, Maharashtra', isActive: true },
    { name: 'Sunita Joshi', email: 'processor@demo.com', password: 'demo123', role: 'processor', organization: 'FreshPack Pvt Ltd', location: 'Pune, Maharashtra', isActive: true },
    { name: 'Anil Mehta', email: 'distributor@demo.com', password: 'demo123', role: 'distributor', organization: 'Swift Logistics', location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'Priya Singh', email: 'retailer@demo.com', password: 'demo123', role: 'retailer', organization: 'City Fresh Mart', location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'Admin User', email: 'admin@demo.com', password: 'demo123', role: 'admin', organization: 'Food Safety Authority', location: 'New Delhi', isActive: true },
  ]);
  console.log('Created 5 demo users.');

  // ─── BATCH 1: Tomatoes (spoilage scenario) ─────────────────────────────────
  const tomatoBatch = await Batch.create({
    batchId: 'BATCH-TOM-DEMO01',
    productName: 'Fresh Tomatoes',
    category: 'vegetables',
    quantity: 500,
    unit: 'kg',
    farmLocation: 'Nashik, Maharashtra',
    harvestDate: new Date('2024-01-10'),
    description: 'Freshly harvested Roma tomatoes, Grade A quality.',
    farmer: farmer._id,
    safeTemperatureMin: 0,
    safeTemperatureMax: 20,
    currentStage: 'Distributor',
    status: 'Spoilage Reported',
    dataHash: '0x' + 'a'.repeat(64),
  });

  // Stage updates for tomatoes
  const tomStages = [
    {
      batch: tomatoBatch._id, batchId: 'BATCH-TOM-DEMO01',
      stage: 'Farmer', participant: farmer._id,
      location: 'Nashik, Maharashtra', condition: 'Good',
      temperature: 18, notes: 'Freshly harvested, stored in cool room at 18°C.',
      timestamp: new Date('2024-01-10T06:00:00Z'), dataHash: '0x' + 'a'.repeat(64),
    },
    {
      batch: tomatoBatch._id, batchId: 'BATCH-TOM-DEMO01',
      stage: 'Processor', participant: processor._id,
      location: 'Pune, Maharashtra', condition: 'Good',
      temperature: 15, notes: 'Inspected and graded. Packed in crates. No defects observed.',
      timestamp: new Date('2024-01-11T10:00:00Z'), dataHash: '0x' + 'b'.repeat(64),
    },
    {
      batch: tomatoBatch._id, batchId: 'BATCH-TOM-DEMO01',
      stage: 'Distributor', participant: distributor._id,
      location: 'Mumbai Warehouse, Maharashtra', condition: 'Warning',
      temperature: 35,
      notes: 'TEMPERATURE BREACH: Refrigeration unit failed. Batch stored at 35°C for ~18 hours. Visual inspection shows early signs of overripening.',
      timestamp: new Date('2024-01-12T14:00:00Z'), dataHash: '0x' + 'c'.repeat(64),
    },
  ];

  await StageUpdate.insertMany(tomStages);

  await SpoilageReport.create({
    batchId: 'BATCH-TOM-DEMO01',
    batch: tomatoBatch._id,
    reportedBy: distributor._id,
    stage: 'Distributor',
    severity: 'High',
    condition: 'Mold visible on approximately 30% of tomatoes. Foul odor present.',
    temperature: 35,
    description: 'Refrigeration failure in warehouse caused temperature to rise to 35°C for 18 hours. Upon opening crates for delivery, visible mold and decomposition detected. Batch is deemed unfit for sale. Root cause: mechanical failure of cooling unit.',
    investigationStatus: 'Under Investigation',
  });

  console.log('Created Tomato batch (BATCH-TOM-DEMO01) with spoilage scenario.');

  // ─── BATCH 2: Rice (healthy journey) ──────────────────────────────────────
  const riceBatch = await Batch.create({
    batchId: 'BATCH-RIC-DEMO02',
    productName: 'Basmati Rice',
    category: 'grains',
    quantity: 1000,
    unit: 'kg',
    farmLocation: 'Dehradun, Uttarakhand',
    harvestDate: new Date('2024-01-08'),
    description: 'Premium Basmati Rice, aged 1 year, long grain variety.',
    farmer: farmer._id,
    safeTemperatureMin: 10,
    safeTemperatureMax: 30,
    currentStage: 'Delivered',
    status: 'Normal',
    dataHash: '0x' + 'd'.repeat(64),
  });

  const riceStages = [
    {
      batch: riceBatch._id, batchId: 'BATCH-RIC-DEMO02',
      stage: 'Farmer', participant: farmer._id,
      location: 'Dehradun, Uttarakhand', condition: 'Good',
      temperature: 22, notes: 'Harvested and dried. Stored in jute bags in dry warehouse at 22°C.',
      timestamp: new Date('2024-01-08T08:00:00Z'), dataHash: '0x' + 'd'.repeat(64),
    },
    {
      batch: riceBatch._id, batchId: 'BATCH-RIC-DEMO02',
      stage: 'Processor', participant: processor._id,
      location: 'Haridwar Processing Unit', condition: 'Good',
      temperature: 24, notes: 'Milled and polished. Quality check passed. Packaged in airtight bags.',
      timestamp: new Date('2024-01-09T11:00:00Z'), dataHash: '0x' + 'e'.repeat(64),
    },
    {
      batch: riceBatch._id, batchId: 'BATCH-RIC-DEMO02',
      stage: 'Distributor', participant: distributor._id,
      location: 'Delhi Distribution Centre', condition: 'Good',
      temperature: 25, notes: 'Transported via temperature-controlled truck. All seals intact.',
      timestamp: new Date('2024-01-10T09:00:00Z'), dataHash: '0x' + 'f'.repeat(64),
    },
    {
      batch: riceBatch._id, batchId: 'BATCH-RIC-DEMO02',
      stage: 'Retailer', participant: retailer._id,
      location: 'City Fresh Mart, Mumbai', condition: 'Good',
      temperature: 23, notes: 'Received 1000kg. Shelf stocked. Customer-facing QR codes applied.',
      timestamp: new Date('2024-01-11T15:00:00Z'), dataHash: '0x' + '1'.repeat(64),
    },
    {
      batch: riceBatch._id, batchId: 'BATCH-RIC-DEMO02',
      stage: 'Delivered', participant: retailer._id,
      location: 'City Fresh Mart, Mumbai', condition: 'Good',
      temperature: 23, notes: 'Full batch sold to customers. Journey complete.',
      timestamp: new Date('2024-01-14T18:00:00Z'), dataHash: '0x' + '2'.repeat(64),
    },
  ];

  await StageUpdate.insertMany(riceStages);
  console.log('Created Rice batch (BATCH-RIC-DEMO02) with healthy journey.');

  console.log('\n=== Seed complete! ===');
  console.log('Demo accounts:');
  console.log('  farmer@demo.com      / demo123  (Farmer)');
  console.log('  processor@demo.com   / demo123  (Processor)');
  console.log('  distributor@demo.com / demo123  (Distributor)');
  console.log('  retailer@demo.com    / demo123  (Retailer)');
  console.log('  admin@demo.com       / demo123  (Admin)');
  console.log('\nDemo batches:');
  console.log('  BATCH-TOM-DEMO01 — Tomatoes (Spoilage at Distributor)');
  console.log('  BATCH-RIC-DEMO02 — Basmati Rice (Healthy complete journey)');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
