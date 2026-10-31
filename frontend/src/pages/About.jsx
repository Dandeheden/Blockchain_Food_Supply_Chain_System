import { Shield, Leaf, Cpu, Info } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Leaf,
      title: 'Farm to Fork Tracking',
      desc: 'Every food batch is registered at the farm and tracked through processing, distribution, retail, and delivery. Each stage is recorded with participant details, timestamps, location, and temperature data.',
    },
    {
      icon: Shield,
      title: 'Blockchain Immutability',
      desc: 'Supply chain records are written to a local Ethereum-compatible blockchain (Hardhat). Once recorded, they cannot be edited. Corrections appear as new entries, preserving a complete audit trail.',
    },
    {
      icon: Cpu,
      title: 'Oracle Simulation',
      desc: 'A simulated oracle demonstrates how IoT sensor data (temperature, humidity) would be fed into the blockchain. In production, a real oracle (e.g., Chainlink) is required to trustlessly bring external data on-chain. Data submitted here is self-reported.',
    },
    {
      icon: Info,
      title: 'Consensus & Network',
      desc: 'The local Hardhat network is used for demonstration. It provides a convenient single-node Ethereum environment. In a production permissioned supply chain, a network like Hyperledger Fabric or Quorum with PBFT/RAFT consensus is more appropriate for enterprise use.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-900 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-8 h-8 text-green-300" />
        </div>
        <h1 className="text-3xl font-bold text-green-900">FoodTrace</h1>
        <p className="text-gray-500 mt-2">Blockchain-Based Food Supply Chain Traceability System</p>
        <span className="inline-block mt-2 badge-info">College Project Demonstration</span>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">Project Objective</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          FoodTrace demonstrates how blockchain technology can improve food supply chain transparency and accountability.
          The system tracks food products from farm to consumer, recording every stage on an immutable ledger. When spoilage
          or contamination occurs, the recorded history helps identify at which stage conditions may have deteriorated,
          facilitating investigation and corrective action.
        </p>
        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
          <strong>Disclaimer:</strong> Blockchain records only what participants submit. If a participant submits incorrect
          data, the blockchain will faithfully record that incorrect data. Blockchain immutability prevents tampering but
          cannot independently verify the truth of submitted data. This system is a demonstration, not a certified food-safety tool.
        </div>
      </div>

      <div className="grid gap-4">
        {features.map(f => (
          <div key={f.title} className="card flex gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <f.icon className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h3 className="font-bold text-green-900">{f.title}</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Technology Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ['Frontend','React.js + Vite'],
            ['Styling','Tailwind CSS'],
            ['Backend','Node.js + Express'],
            ['Database','MongoDB'],
            ['Blockchain','Hardhat (Local)'],
            ['Smart Contract','Solidity ^0.8.20'],
            ['Wallet Lib','ethers.js v5'],
            ['Charts','Recharts'],
            ['QR Codes','qrcode.react'],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400">{label}</div>
              <div className="font-semibold text-sm text-green-800 mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">Demo Scenario: Tomato Spoilage</h2>
        <ol className="text-sm text-gray-600 space-y-3 list-decimal list-inside">
          <li>A farmer registers a 500kg batch of tomatoes with a safe temperature range of 0–20°C.</li>
          <li>The batch passes through a processor who records temperature 18°C — condition: Good.</li>
          <li>The distributor stores the batch at 35°C — a breach of safe temperature. System flags: Warning.</li>
          <li>The distributor reports spoilage, noting mold and high temperature. This is recorded on the blockchain.</li>
          <li>The admin investigates, reviewing the complete on-chain timeline and temperature records.</li>
          <li>The investigation identifies the distributor stage as where conditions may have contributed to spoilage.</li>
          <li className="text-amber-600 font-medium">Note: Blockchain shows what was recorded. It cannot prove the distributor was at fault — the product may have been received already compromised.</li>
        </ol>
      </div>
    </div>
  );
}
