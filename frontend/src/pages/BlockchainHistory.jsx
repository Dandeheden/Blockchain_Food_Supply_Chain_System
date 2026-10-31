import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatDate, shortHash, stageIcon, statusBadgeClass } from '../utils/helpers';
import { Shield, Hash } from 'lucide-react';

export default function BlockchainHistory() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api.get('/batches').then(r => setBatches(r.data.batches || [])).finally(() => setLoading(false));
  }, []);

  const loadDetail = async (batchId) => {
    if (selected === batchId) return;
    setSelected(batchId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/batches/${batchId}`);
      setDetail(res.data);
    } catch {}
    finally { setDetailLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-green-900">Blockchain Transaction History</h1>
        <p className="text-gray-500 text-sm mt-0.5">View all transactions recorded on the local Hardhat blockchain</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <Shield className="w-4 h-4 inline mr-2" />
        <strong>Local Hardhat Network</strong> — This demonstrates blockchain functionality using a local Ethereum-compatible development node (chainId 1337). In production, a permissioned blockchain (e.g. Hyperledger Fabric, Quorum) with enterprise consensus would be more appropriate.
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Batch list */}
        <div className="card">
          <h3 className="section-title mb-4">Registered Batches ({batches.length})</h3>
          <div className="space-y-2">
            {batches.map(b => (
              <button key={b._id} onClick={() => loadDetail(b.batchId)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selected === b.batchId ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{b.productName}</div>
                    <div className="hash-text">{b.batchId}</div>
                  </div>
                  <span className={statusBadgeClass(b.status)}>{b.status}</span>
                </div>
                {b.contractTxHash && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <Hash className="w-3 h-3" />
                    <span className="hash-text">{shortHash(b.contractTxHash)}</span>
                    {b.contractBlockNumber && <span className="ml-1">Block #{b.contractBlockNumber}</span>}
                  </div>
                )}
              </button>
            ))}
            {batches.length === 0 && (
              <p className="text-center text-gray-400 py-8">No batches registered yet.</p>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="card">
          {!selected && (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 py-16">
              <Shield className="w-12 h-12 mb-3 opacity-30" />
              <p>Select a batch to view its blockchain records</p>
            </div>
          )}
          {selected && detailLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {detail && (
            <div className="space-y-4">
              <h3 className="section-title">{detail.batch.productName} — TX Log</h3>
              <div className="space-y-3">
                {detail.stages.map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{stageIcon(s.stage)}</span>
                      <span className="font-semibold text-sm">{s.stage}</span>
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(s.timestamp)}</span>
                    </div>
                    {s.txHash ? (
                      <>
                        <div className="flex items-center gap-1 text-xs">
                          <Hash className="w-3 h-3 text-green-600" />
                          <span className="hash-text">{s.txHash}</span>
                        </div>
                        {s.blockNumber && <div className="text-xs text-gray-500 mt-0.5">Block #{s.blockNumber}</div>}
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic">No TX recorded (blockchain node may have been offline)</div>
                    )}
                    {s.dataHash && <div className="text-xs text-gray-400 mt-1">Data Hash: {shortHash(s.dataHash)}</div>}
                  </div>
                ))}
              </div>

              {detail.blockchain?.history?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-green-800 mb-2">On-Chain Read (Live)</h4>
                  {detail.blockchain.history.map((h, i) => (
                    <div key={i} className="text-xs bg-green-50 rounded-lg p-2 mb-1 border border-green-100">
                      <span className="font-mono font-semibold">{h.stage}</span>
                      <div><span className="text-gray-500">Participant: </span><span className="hash-text">{h.participant}</span></div>
                      <div className="hash-text">Hash: {h.dataHash}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
