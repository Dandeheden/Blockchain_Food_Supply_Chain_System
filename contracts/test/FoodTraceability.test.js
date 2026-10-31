const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('FoodTraceability', function () {
  let contract, admin, farmer, processor, distributor;

  beforeEach(async () => {
    [admin, farmer, processor, distributor] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('FoodTraceability');
    contract = await Factory.deploy();
    await contract.deployed();

    // Register participants
    await contract.registerParticipant(farmer.address, 1); // Farmer
    await contract.registerParticipant(processor.address, 2); // Processor
    await contract.registerParticipant(distributor.address, 3); // Distributor
  });

  it('should register a batch', async () => {
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('batch001'));
    await contract.connect(farmer).registerBatch('BATCH001', hash);
    const batch = await contract.getBatch('BATCH001');
    expect(batch.batchId).to.equal('BATCH001');
    expect(batch.spoiled).to.equal(false);
  });

  it('should update stage', async () => {
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('batch002'));
    await contract.connect(farmer).registerBatch('BATCH002', hash);
    await contract.connect(processor).updateStage(
      'BATCH002', 'Processor', 'Plant A', 'Good', 220, hash, 'Processing done'
    );
    const history = await contract.getStageHistory('BATCH002');
    expect(history.length).to.equal(2);
    expect(history[1].stage).to.equal('Processor');
  });

  it('should report spoilage', async () => {
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('batch003'));
    await contract.connect(farmer).registerBatch('BATCH003', hash);
    await contract.connect(distributor).reportSpoilage('BATCH003', 'Distributor', 'Temperature too high');
    const batch = await contract.getBatch('BATCH003');
    expect(batch.spoiled).to.equal(true);
  });

  it('should prevent non-authorized users from registering batches', async () => {
    const [,,,, stranger] = await ethers.getSigners();
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('batch004'));
    await expect(
      contract.connect(stranger).registerBatch('BATCH004', hash)
    ).to.be.revertedWith('Not authorized');
  });
});
