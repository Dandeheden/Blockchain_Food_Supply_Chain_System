/**
 * Blockchain Service
 * Interacts with the deployed FoodTraceability smart contract via ethers.js.
 * Private key is kept server-side only. Never exposed to frontend.
 */
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

let provider, signer, contract;

const getContract = () => {
  if (contract) return contract;

  const rpcUrl = process.env.HARDHAT_RPC_URL || 'http://127.0.0.1:8545';
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!privateKey || !contractAddress) {
    console.warn('[Blockchain] DEPLOYER_PRIVATE_KEY or CONTRACT_ADDRESS not set. Blockchain features disabled.');
    return null;
  }

  const abiPath = path.join(__dirname, '../abi/FoodTraceability.json');
  if (!fs.existsSync(abiPath)) {
    console.warn('[Blockchain] ABI file not found. Run: cd contracts && npm run deploy');
    return null;
  }

  const { abi } = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  signer = new ethers.Wallet(privateKey, provider);
  contract = new ethers.Contract(contractAddress, abi, signer);
  return contract;
};

/**
 * Compute keccak256 hash of a JS object (JSON stringified).
 */
const hashData = (data) => {
  const json = JSON.stringify(data, Object.keys(data).sort());
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(json));
};

/**
 * Register a batch on-chain.
 */
const registerBatchOnChain = async (batchId, batchData) => {
  const c = getContract();
  if (!c) return null;

  try {
    const dataHash = hashData(batchData);
    const tx = await c.registerBatch(batchId, dataHash);
    const receipt = await tx.wait();
    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      dataHash,
    };
  } catch (err) {
    console.error('[Blockchain] registerBatch error:', err.message);
    return null;
  }
};

/**
 * Update supply-chain stage on-chain.
 */
const updateStageOnChain = async (batchId, stageData) => {
  const c = getContract();
  if (!c) return null;

  try {
    const dataHash = hashData(stageData);
    const tempTenths = Math.round((stageData.temperature || 0) * 10);
    const tx = await c.updateStage(
      batchId,
      stageData.stage,
      stageData.location || '',
      stageData.condition || 'Good',
      tempTenths,
      dataHash,
      stageData.notes || ''
    );
    const receipt = await tx.wait();
    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      dataHash,
    };
  } catch (err) {
    console.error('[Blockchain] updateStage error:', err.message);
    return null;
  }
};

/**
 * Report spoilage on-chain.
 */
const reportSpoilageOnChain = async (batchId, stage, notes) => {
  const c = getContract();
  if (!c) return null;

  try {
    const tx = await c.reportSpoilage(batchId, stage, notes);
    const receipt = await tx.wait();
    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
    };
  } catch (err) {
    console.error('[Blockchain] reportSpoilage error:', err.message);
    return null;
  }
};

/**
 * Fetch complete on-chain stage history for a batch.
 */
const getOnChainHistory = async (batchId) => {
  const c = getContract();
  if (!c) return null;

  try {
    const history = await c.getStageHistory(batchId);
    return history.map(h => ({
      stage: h.stage,
      participant: h.participant,
      timestamp: new Date(h.timestamp.toNumber() * 1000).toISOString(),
      location: h.location,
      condition: h.condition,
      temperature: h.temperature.toNumber() / 10,
      dataHash: h.dataHash,
      notes: h.notes,
    }));
  } catch (err) {
    console.error('[Blockchain] getStageHistory error:', err.message);
    return null;
  }
};

/**
 * Get on-chain batch info.
 */
const getOnChainBatch = async (batchId) => {
  const c = getContract();
  if (!c) return null;

  try {
    const batch = await c.getBatch(batchId);
    return {
      batchId: batch.batchId,
      owner: batch.owner,
      dataHash: batch.dataHash,
      spoiled: batch.spoiled,
      createdAt: new Date(batch.createdAt.toNumber() * 1000).toISOString(),
    };
  } catch (err) {
    console.error('[Blockchain] getBatch error:', err.message);
    return null;
  }
};

module.exports = {
  hashData,
  registerBatchOnChain,
  updateStageOnChain,
  reportSpoilageOnChain,
  getOnChainHistory,
  getOnChainBatch,
};
