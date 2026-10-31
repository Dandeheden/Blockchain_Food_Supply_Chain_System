const hre = require('hardhat');
const fs  = require('fs');
const path = require('path');

async function main() {
  console.log('Deploying FoodTraceability contract...');

  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const FoodTraceability = await hre.ethers.getContractFactory('FoodTraceability');
  const contract = await FoodTraceability.deploy();
  await contract.deployed();

  console.log('FoodTraceability deployed to:', contract.address);

  // Write contract address to backend .env and to a shared JSON for frontend
  const envPath = path.join(__dirname, '../../.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  const updateEnv = (content, key, value) => {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    }
    return content + `\n${key}=${value}`;
  };

  envContent = updateEnv(envContent, 'CONTRACT_ADDRESS', contract.address);
  fs.writeFileSync(envPath, envContent);

  // Copy ABI to backend and frontend
  const artifactPath = path.join(__dirname, '../artifacts/contracts/FoodTraceability.sol/FoodTraceability.json');
  const backendAbiPath = path.join(__dirname, '../../backend/src/abi/FoodTraceability.json');
  const frontendAbiPath = path.join(__dirname, '../../frontend/src/abi/FoodTraceability.json');

  fs.mkdirSync(path.dirname(backendAbiPath), { recursive: true });
  fs.mkdirSync(path.dirname(frontendAbiPath), { recursive: true });

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abiOnly = JSON.stringify({ address: contract.address, abi: artifact.abi }, null, 2);

  fs.writeFileSync(backendAbiPath, abiOnly);
  fs.writeFileSync(frontendAbiPath, abiOnly);

  console.log('ABI copied to backend and frontend');
  console.log('Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
