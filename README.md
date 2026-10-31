# 🌾 Blockchain-Based Food Supply Chain Traceability System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Ethereum%20Dev-yellow.svg)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)

A full-stack, enterprise-grade decentralized application (DApp) that ensures end-to-end provenance, cold-chain compliance, and auditability across agricultural food supply chains. By combining off-chain document storage with on-chain cryptographic state hashes, the platform guarantees data immutability, tamper detection, and transparent food safety tracking from farm to consumer.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Supply Chain Roles](#-supply-chain-roles)
- [Demo Scenarios](#-demo-scenarios)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Deploying Smart Contracts](#-deploying-smart-contracts-optional-hardhat)
- [Pre-configured Demo Accounts](#-pre-configured-demo-accounts)
- [Smart Contract Testing](#-smart-contract-testing)
- [Important Disclaimers](#-important-disclaimers)
- [Author & Acknowledgements](#-author--acknowledgements)

---

## 📖 Overview

Conventional food supply chains operate as disparate, disconnected information silos with limited transparency ("one up, one down"). When perishable produce experiences temperature excursions during transit or contamination occurs, auditing paper manifests or centralized databases introduces significant delays, leading to catastrophic blanket recalls and widespread food waste.

This system provides:
1. **Cryptographic Provenance:** Every agricultural batch is minted with a unique identifier and tracked sequentially across Farmer, Processor, Distributor, and Retailer stages.
2. **Hybrid Storage Model:** Heavy metadata, geographic coordinates, and sensory telemetry are stored in MongoDB, while cryptographic SHA-256 state hashes (`dataHash`) and custody transitions are anchored immutably to an Ethereum smart contract.
3. **Automated Spoilage Flags:** Real-time environmental checks flag temperature excursions exceeding safe product thresholds, generating non-repudiable on-chain incident logs.
4. **Consumer Transparency:** Dynamic QR code generation enables consumers and health regulators to view complete harvest-to-retail provenance with a single scan—no login required.

---

## 🏛 System Architecture

```text
+-------------------------------------------------------------------------------+
|                                1. USER LAYER                                  |
|   +----------+    +-----------+    +-------------+   +----------+   +-----+   |
|   |  Farmer  |    | Processor |    | Distributor |   | Retailer |   |Admin|   |
|   +----+-----+    +-----+-----+    +------+------+   +----+-----+   +--+--+   |
|        |                |                 |               |            |      |
|        +----------------+-----------------+---------------+------------+      |
|                                 |                                             |
|                     (Browser / Mobile Client)                                 |
+---------------------------------+---------------------------------------------+
                                  | HTTP / HTTPS (REST API)
                                  v
+-------------------------------------------------------------------------------+
|                       2. WEB APPLICATION LAYER                                |
|  +-------------------------------------------------------------------------+  |
|  | Frontend: React.js (Vite) + Tailwind CSS + Lucide Icons + Recharts      |  |
|  +-------------------------------------------------------------------------+  |
|  | Backend: Node.js + Express.js API Server                                |  |
|  |   - Auth & RBAC Middleware (JWT Token Verification)                     |  |
|  |   - Express REST Routes: /batches, /stages, /spoilage, /oracle, /admin  |  |
|  |   - Cryptographic Hash Utility (crypto.createHash('sha256'))            |  |
|  |   - Simulated IoT Oracle Service (Temperature & Humidity Simulation)    |  |
|  +-------------------------------------------------------------------------+  |
|  | Database: MongoDB (Mongoose ODM)                                        |  |
|  |   - Users, Batches, StageUpdates, SpoilageReports Collections           |  |
|  +-------------------------------------------------------------------------+  |
|  | Blockchain Gateway Service: ethers.js (v5.7.2 JSON-RPC Provider)        |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------+---------------------------------------------+
                                  | JSON-RPC (HTTP 8545)
                                  v
+-------------------------------------------------------------------------------+
|                           3. BLOCKCHAIN LAYER                                 |
|  +-------------------------------------------------------------------------+  |
|  | EVM Host: Hardhat Local Development Node (Chain ID: 1337)               |  |
|  +-------------------------------------------------------------------------+  |
|  | Smart Contract: FoodTraceability.sol                                    |  |
|  |   - State Mappings: batches, batchStages, participants, spoilageReports|  |
|  |   - Functional Logic: registerBatch, updateStage, reportSpoilage        |  |
|  |   - Events: BatchRegistered, StageUpdated, SpoilageReported             |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## ✨ Key Features

- **Decentralized Access Control (RBAC):** Cryptographically enforces role permissions on-chain and at the API layer (Farmer, Processor, Distributor, Retailer, Admin).
- **Sequential Stage Progression:** Smart contract logic prevents reverting stages or logging updates on spoiled batches.
- **Simulated IoT Oracle:** Emulates multi-sensor cold-chain telemetry (temperature and humidity) with configurable warehouse and transit vehicle probes.
- **Cryptographic State Integrity:** Every stage update calculates a SHA-256 hash of off-chain metadata, anchoring it to the smart contract for tamper detection.
- **Visual Analytics:** Interactive dashboards featuring Recharts for stage distribution, batch status breakdown, and cold-chain compliance.
- **Dynamic QR Code Engine:** Generates high-resolution QR codes linking to public consumer verification pages.
- **Administrative Quarantine:** Regulatory portal for reviewing flagged temperature violations, managing participants, and tracking investigations.

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Blockchain & Smart Contracts** | Solidity (`0.8.20`), Hardhat, Ethers.js (`v5.7.2`), OpenZeppelin patterns |
| **Backend API** | Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs, express-validator |
| **Database** | MongoDB, Mongoose ODM |
| **Frontend Client** | React 18, Vite, Tailwind CSS (v3), Lucide React, Recharts, Axios |
| **Tools & Utilities** | QRCode, crypto (SHA-256), dotenv, Nodemon |

---

## 👥 Supply Chain Roles

| Role | Primary Permissions & Responsibilities |
| :--- | :--- |
| **🌾 Farmer** | Registers agricultural batches at harvest, sets crop category, harvest date, and safe temperature thresholds. |
| **🏭 Processor** | Updates custody upon produce intake, records washing, quality sorting, processing, and cold-packaging logs. |
| **🚚 Distributor** | Records multimodal logistics dispatches, freight carrier info, transit waypoints, and telemetry readings. |
| **🏪 Retailer** | Verifies batch condition at store receipt, confirms final shelf placement, or marks batch as Delivered. |
| **🛡️ Admin / Regulator** | Registers ecosystem participants, reviews audit logs, investigates flagged batches, and manages user accounts. |
| **👤 Public Consumer** | Scans packaging QR codes for instant, unauthenticated verification of harvest origin and temperature compliance. |

---

## 🧪 Demo Scenarios

The system includes pre-seeded demo batches illustrating real-world supply chain workflows:

### Scenario A: Cold-Chain Breakdown & Spoilage (`BATCH-TOM-DEMO01`)
- **Product:** Fresh Tomatoes (Safe Range: 10°C to 20°C)
- **Journey:** Farm (18°C - Normal) ➔ Processor (15°C - Good) ➔ Transit Freight (35°C - **CRITICAL EXCURSION**)
- **Outcome:** System flags `Warning`, Distributor logs a formal on-chain Spoilage Report (Mold / Thermal Degradation), batch state transitions to `Spoiled`, and admin investigation is initiated.

### Scenario B: Optimal Provenance Journey (`BATCH-RIC-DEMO02`)
- **Product:** Basmati Rice (Safe Range: 15°C to 30°C)
- **Journey:** Farm (24°C) ➔ Processing Mill (22°C) ➔ Logistics Warehouse (21°C) ➔ Retail Mart (20°C)
- **Outcome:** Clean delivery across all stages, full green compliance badges, valid on-chain transaction history.

---

## 📁 Project Structure

```text
FoodTraceability/
│
├── .env.example                      # Template for environment configuration
├── .gitignore                        # Global Git ignore rules (node_modules, .env, build artifacts)
├── README.md                         # Comprehensive documentation
│
├── contracts/                        # Hardhat & Solidity Smart Contract
│   ├── contracts/
│   │   └── FoodTraceability.sol      # Core smart contract
│   ├── scripts/
│   │   ├── deploy.js                 # Contract deployment & ABI synchronization script
│   │   └── seed.js                   # On-chain test seeding script
│   ├── test/
│   │   └── FoodTraceability.test.js  # Automated Chai/Ethers unit test suite
│   ├── hardhat.config.js             # Hardhat network config (Chain ID: 1337)
│   └── package.json                  # Contract workspace dependencies
│
├── backend/                          # Express.js REST API & Services
│   ├── scripts/
│   │   └── seedDb.js                 # Database seeder (creates 5 roles & demo batches)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB Mongoose connection
│   │   │   └── contractABI.json      # Deployed FoodTraceability contract ABI
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification & RBAC role guards
│   │   ├── models/
│   │   │   ├── Batch.js              # Product batch schema
│   │   │   ├── SpoilageReport.js     # Spoilage incident report schema
│   │   │   ├── StageUpdate.js        # Stage milestone schema
│   │   │   └── User.js               # User authentication & profile schema
│   │   ├── routes/
│   │   │   ├── admin.js              # Regulatory dashboard endpoints
│   │   │   ├── auth.js               # User auth, registration & profile
│   │   │   ├── batches.js            # Batch registration and queries
│   │   │   ├── oracle.js             # Simulated sensor telemetry
│   │   │   ├── qrcode.js             # QR code image generation & streaming
│   │   │   ├── spoilage.js           # Spoilage submission & investigation
│   │   │   └── stages.js             # Custody progression updates
│   │   ├── services/
│   │   │   ├── blockchain.js         # Ethers.js smart contract gateway
│   │   │   └── oracle.js             # Cold-chain sensor simulator
│   │   └── server.js                 # Express server entry point
│   └── package.json                  # Backend dependencies & npm scripts
│
└── frontend/                         # React.js (Vite) Single Page Application
    ├── public/                       # Static public assets
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global user session & JWT management
    │   ├── pages/
    │   │   ├── About.jsx             # System architecture & educational overview
    │   │   ├── AddBatch.jsx          # Batch registration form for farmers
    │   │   ├── AdminDashboard.jsx    # Regulatory investigation & user management
    │   │   ├── BatchDetail.jsx       # Detailed batch timeline & on-chain records
    │   │   ├── BlockchainHistory.jsx # On-chain transaction & hash explorer
    │   │   ├── Dashboard.jsx         # Analytics dashboard with visual charts
    │   │   ├── Login.jsx             # Authentication page with quick-login buttons
    │   │   ├── PublicBatchView.jsx   # Public, unauthenticated consumer provenance page
    │   │   ├── QRCodePage.jsx        # QR code generator & SVG export
    │   │   ├── Register.jsx          # User registration with role selector
    │   │   ├── SpoilageReport.jsx    # Spoilage incident submission form
    │   │   ├── TrackBatch.jsx        # Searchable timeline with temperature warnings
    │   │   └── UpdateStage.jsx       # Custody transition form with simulated oracle
    │   ├── utils/
    │   │   ├── api.js                # Axios HTTP client with JWT interceptors
    │   │   └── helpers.js            # Formatters, badge stylers & validation helpers
    │   ├── App.jsx                   # React Router v6 routing matrix & route guards
    │   ├── index.css                 # Tailwind CSS styles & custom badge classes
    │   └── main.jsx                  # React DOM entry point
    ├── postcss.config.js             # PostCSS Tailwind configuration
    ├── tailwind.config.js            # Tailwind styling tokens
    ├── vite.config.js                # Vite build pipeline & API proxy configuration
    └── package.json                  # Frontend dependencies & npm scripts
```

---

## 📋 Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v9.0.0 or higher (packaged with Node.js)
- **MongoDB:** Local MongoDB Community Server running on `mongodb://localhost:27017` or a MongoDB Atlas URI ([Download MongoDB](https://www.mongodb.com/try/download/community))
- **Git:** Installed and configured ([Download Git](https://git-scm.com/))

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Dandeheden/Blockchain_Food_Supply_Chain_System.git
cd Blockchain_Food_Supply_Chain_System
```

### 2. Configure Environment Variables
Create a `.env` file at the root of the project by copying `.env.example`:
```bash
cp .env.example .env
```
Default configuration values for local development:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/food_traceability
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
HARDHAT_RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=
```

### 3. Install Dependencies
Install dependencies for all workspaces:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install smart contract dependencies
cd ../contracts
npm install

cd ..
```

### 4. Seed the Database
Populate MongoDB with default user accounts and demonstration batches:
```bash
cd backend
npm run seed
cd ..
```

---

## 🚀 Running the Application

### Start the Backend API Server
```bash
cd backend
npm run dev
```
*Backend runs at:* **`http://localhost:5000`** *(Health check: `http://localhost:5000/api/health`)*

### Start the Frontend Web Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
*Frontend runs at:* **`http://localhost:5173`**

---

## 🔗 Deploying Smart Contracts (Optional: Hardhat)

The application functions seamlessly in standalone mode with MongoDB (blockchain interactions fail gracefully if no contract is deployed). To enable full on-chain Ethereum transaction recording:

### Terminal 1: Start the Local Hardhat Node
```bash
cd contracts
npx hardhat node
```
*This starts a local JSON-RPC Ethereum node on `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

### Terminal 2: Compile & Deploy the Smart Contract
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```
*The deployment script will:*
1. Compile `FoodTraceability.sol`.
2. Deploy the contract to your local Hardhat node.
3. Automatically update `CONTRACT_ADDRESS` in your root `.env` file.
4. Synchronize the compiled ABI to `backend/src/config/contractABI.json` and `frontend/src/abi/FoodTraceability.json`.

Restart the backend server to activate on-chain transactions!

---

## 🔑 Pre-configured Demo Accounts

Use these credentials to sign in (or click the quick-login pills on the Login page):

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `demo123` | Food Safety Authority |
| **Farmer** | `farmer@demo.com` | `demo123` | Green Valley Organic Farms |
| **Processor** | `processor@demo.com` | `demo123` | PureHarvest Processing Ltd |
| **Distributor** | `distributor@demo.com` | `demo123` | ColdChain Express Logistics |
| **Retailer** | `retailer@demo.com` | `demo123` | FreshMart Supermarkets |

---

## 🧪 Smart Contract Testing

Run the automated smart contract unit test suite to verify role enforcement, batch registration, and spoilage logic:
```bash
cd contracts
npx hardhat test
```

Expected test coverage:
- ✅ Contract deployment and admin assignment
- ✅ Participant role registration and unauthorized caller rejection
- ✅ Batch registration and duplicate batch ID prevention
- ✅ Sequential stage updates and backwards transition rejection
- ✅ Automatic temperature boundary warnings
- ✅ Spoilage reporting and status locking

---

## ⚠️ Important Disclaimers

1. **Self-Reported Data:** Blockchain immutability guarantees that once submitted, data cannot be modified. However, it cannot independently guarantee that entered data was accurate at the time of entry ("Garbage In, Garbage Out").
2. **Simulated Oracle:** The environmental sensor telemetry in this project is simulated for demonstration purposes. A production deployment requires tamper-resistant hardware dataloggers integrated with a decentralized oracle network (e.g., Chainlink).
3. **Development Blockchain:** The local Hardhat node is intended solely for local development and demonstration. Production deployments should target permissioned consortium blockchains (e.g., Hyperledger Besu, Quorum) or Ethereum Layer-2 rollups.

---

## 👨‍💻 Author & Acknowledgements

- **Developer:** Heden Dande ([@Dandeheden](https://github.com/Dandeheden))
- **Institution:** Prasad V. Potluri Siddhartha Institute of Technology (PVPSIT), Kanuru, Vijayawada
- **Department:** Department of Computer Science and Engineering
- **Course:** Blockchain Technology (`20CS4601C`)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
