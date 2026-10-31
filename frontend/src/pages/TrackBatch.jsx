import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, shortHash, stageIcon, conditionBadgeClass, statusBadgeClass, conditionColor } from '../utils/helpers';
import { Search, MapPin, Thermometer, User, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackBatch() {
  const navigate = useNavigate();
  const [batchId, setBatchId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async e => {
    e.preventDefault();
    if (!batchId.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/batches/${batchId.trim()}`);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Batch not found.');
      setData(null);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-green-900">Track Product</h1>
        <p className="text-gray-500 text-sm mt-0.5">Enter a batch ID to view its complete supply chain history</p>
      </div>

      <form onSubmit={search} className="flex gap-3">
        <input
          id="batch-search-input" value={batchId} onChange={e => setBatchId(e.target.value)}
          className="input flex-1 font-mono" placeholder="Enter Batch ID (e.g. BATCH-TOM-ABC123)"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
          Track
        </button>
      </form>

      {data && (
        <div className="space-y-6">
          {/* Batch Overview */}
          <div className="card">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-green-900">{data.batch.productName}</h2>
                <p className="hash-text mt-1">{data.batch.batchId}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className={statusBadgeClass(data.batch.status)}>{data.batch.status}</span>
                  <span className="badge-info">{data.batch.currentStage}</span>
                  <span className="badge-info">{data.batch.category}</span>
                </div>
              </div>
              <button onClick={() => navigate(`/qrcode?batch=${data.batch.batchId}`)} className="btn-secondary text-xs">
                View QR Code
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t text-sm">
              <div><div className="text-xs text-gray-400">Quantity</div><div className="font-semibold">{data.batch.quantity} {data.batch.unit}</div></div>
              <div><div className="text-xs text-gray-400">Harvest Date</div><div className="font-semibold">{formatDate(data.batch.harvestDate).split(',')[0]}</div></div>
              <div><div className="text-xs text-gray-400">Farm Location</div><div className="font-semibold">{data.batch.farmLocation}</div></div>
              <div><div className="text-xs text-gray-400">Safe Temp</div><div className="font-semibold">{data.batch.safeTemperatureMin}°C – {data.batch.safeTemperatureMax}°C</div></div>
            </div>

            {data.batch.contractTxHash && (
              <div className="mt-4 pt-4 border-t bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 font-semibold mb-1">🔗 Blockchain Registration</div>
                <div className="text-xs"><span className="font-medium">TX Hash: </span><span className="hash-text">{data.batch.contractTxHash}</span></div>
                <div className="text-xs"><span className="font-medium">Block: </span>{data.batch.contractBlockNumber}</div>
              </div>
            )}
          </div>

          {/* Spoilage Alerts */}
          {data.spoilageReports?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <h3 className="text-red-800 font-bold mb-3">⚠️ Spoilage Reports ({data.spoilageReports.length})</h3>
              <p className="text-xs text-red-600 mb-3">
                Note: The blockchain records when and where spoilage was reported. An investigation is needed to determine the actual cause. Blockchain records self-reported data only.
              </p>
              {data.spoilageReports.map((r, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-red-200 mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-red-700">Stage: {r.stage}</span>
                    <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="text-sm text-gray-700">{r.description}</div>
                  {r.temperature != null && <div className="text-xs text-gray-500 mt-1">🌡️ Reported temperature: {r.temperature}°C</div>}
                  {r.txHash && <div className="hash-text mt-1">TX: {r.txHash}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h3 className="section-title mb-6">Supply Chain Timeline</h3>
            <div className="relative">
              {data.stages.map((stage, i) => (
                <div key={i} className="flex gap-4 mb-6 last:mb-0 relative">
                  {i < data.stages.length - 1 && (
                    <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-green-200" />
                  )}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm text-white ${conditionColor(stage.condition)}`}>
                    <span className="text-sm">{stageIcon(stage.stage)}</span>
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{stage.stage}</span>
                      <span className={conditionBadgeClass(stage.condition)}>{stage.condition}</span>
                      <span className="text-xs text-gray-400">{formatDate(stage.timestamp)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                      {stage.participant && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {stage.participant.name} ({stage.participant.role})
                        </div>
                      )}
                      {stage.location && (
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {stage.location}</div>
                      )}
                      {stage.temperature != null && (
                        <div className={`flex items-center gap-1 ${
                          (data.batch?.safeTemperatureMax != null && stage.temperature > data.batch.safeTemperatureMax) ||
                          (data.batch?.safeTemperatureMin != null && stage.temperature < data.batch.safeTemperatureMin)
                            ? 'text-red-600 font-bold' : ''
                        }`}>
                          <Thermometer className="w-3 h-3" /> {stage.temperature}°C
                          {((data.batch?.safeTemperatureMax != null && stage.temperature > data.batch.safeTemperatureMax) ||
                            (data.batch?.safeTemperatureMin != null && stage.temperature < data.batch.safeTemperatureMin)) &&
                            <span className="ml-1 text-red-600">⚠️ Out of range!</span>
                          }
                        </div>
                      )}
                    </div>
                    {stage.notes && <p className="text-xs text-gray-500 mt-2 italic">"{stage.notes}"</p>}
                    {stage.txHash && (
                      <div className="mt-2 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-gray-400" />
                        <span className="hash-text">{shortHash(stage.txHash)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On-chain data */}
          {data.blockchain?.history?.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4">🔗 On-Chain Records (Live Read)</h3>
              <p className="text-xs text-gray-400 mb-4">Data fetched directly from the Hardhat local blockchain node.</p>
              <div className="space-y-2">
                {data.blockchain.history.map((h, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">{h.stage}</span>
                      <span className="text-gray-400">{h.timestamp}</span>
                    </div>
                    <div className="hash-text mt-1">DataHash: {h.dataHash}</div>
                    <div className="text-gray-500">Participant: {h.participant}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
