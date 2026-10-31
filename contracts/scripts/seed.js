/**
 * Seed script: registers demo participants and batches on the local Hardhat network.
 * Run: npx hardhat run scripts/seed.js --network localhost
 */
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const signers = await ethers.getSigners();
  const [admin, farmer, processor, distributor, retailer] = signers;

  const FoodTraceability = await ethers.getContractFactory('FoodTraceability');
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error('CONTRACT_ADDRESS not set in .env');

  const contract = FoodTraceability.attach(contractAddress);

  console.log('Registering participants...');
  await (await contract.connect(admin).registerParticipant(farmer.address, 1)).wait();
  await (await contract.connect(admin).registerParticipant(processor.address, 2)).wait();
  await (await contract.connect(admin).registerParticipant(distributor.address, 3)).wait();
  await (await contract.connect(admin).registerParticipant(retailer.address, 4)).wait();
  console.log('Participants registered.');

  // Batch 1 – Tomatoes (spoilage scenario)
  const b1Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify({
    name: 'Tomatoes', batchId: 'BATCH-TOM-001', quantity: 500, unit: 'kg'
  })));
  await (await contract.connect(farmer).registerBatch('BATCH-TOM-001', b1Hash)).wait();
  await (await contract.connect(processor).updateStage('BATCH-TOM-001', 'Processor', 'Mumbai Plant', 'Good', 180, b1Hash, 'Cleaned and packed')).wait();
  await (await contract.connect(distributor).updateStage('BATCH-TOM-001', 'Distributor', 'Pune Warehouse', 'Warning', 350, b1Hash, 'Temperature exceeded safe range')).wait();
  await (await contract.connect(distributor).reportSpoilage('BATCH-TOM-001', 'Distributor', 'Tomatoes showing mold. Storage temperature was 35C, safe limit is 20C.')).wait();

  // Batch 2 – Rice (healthy)
  const b2Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify({
    name: 'Rice', batchId: 'BATCH-RICE-002', quantity: 1000, unit: 'kg'
  })));
  await (await contract.connect(farmer).registerBatch('BATCH-RICE-002', b2Hash)).wait();
  await (await contract.connect(processor).updateStage('BATCH-RICE-002', 'Processor', 'Delhi Mill', 'Good', 250, b2Hash, 'Milled and bagged')).wait();
  await (await contract.connect(distributor).updateStage('BATCH-RICE-002', 'Distributor', 'Agra Hub', 'Good', 240, b2Hash, 'In transit')).wait();
  await (await contract.connect(retailer).updateStage('BATCH-RICE-002', 'Retailer', 'BigMart Store', 'Good', 220, b2Hash, 'On shelf')).wait();

  console.log('Seed data committed to blockchain.');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
