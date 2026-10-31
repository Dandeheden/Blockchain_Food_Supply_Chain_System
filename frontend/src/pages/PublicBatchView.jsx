import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatDate, stageIcon, conditionBadgeClass, statusBadgeClass, conditionColor, shortHash } from '../utils/helpers';
import { Leaf, MapPin, Thermometer, Hash } from 'lucide-react';

export default function PublicBatchView() {
  const { batchId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetch(`${API_URL}/batches/public/${batchId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d);
        else setError(d.message || 'Batch not found.');
      })
      .catch(() => setError('Failed to load batch data.'))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="card text-center max-w-sm">
        <p className="text-red-500 font-medium">{error}</p>
        <p className="text-gray-400 text-sm mt-2">Check the batch ID and try again.</p>
      </div>
    </div>
  );

  const { batch, stages, spoilageReports } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-green-900 text-white px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
          <Leaf className="w-4 h-4 text-green-900" />
        </div>
        <div>
          <div className="font-bold text-sm">FoodTrace</div>
          <div className="text-green-300 text-xs">Product Traceability — Public View</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Product header */}
        <div className="card">
          <h1 className="text-2xl font-bold text-green-900">{batch.productName}</h1>
          <p className="hash-text mt-1">{batch.batchId}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className={statusBadgeClass(batch.status)}>{batch.status}</span>
            <span className="badge-info">{batch.category}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t text-sm">
            <div><span className="text-gray-400">Quantity: </span><strong>{batch.quantity} {batch.unit}</strong></div>
            <div><span className="text-gray-400">Farmer: </span><strong>{batch.farmer?.name || 'Unknown'}</strong></div>
            <div><span className="text-gray-400">Farm: </span><strong>{batch.farmLocation}</strong></div>
            <div><span className="text-gray-400">Harvest: </span><strong>{formatDate(batch.harvestDate).split(',')[0]}</strong></div>
          </div>
        </div>

        {/* Spoilage alert */}
        {spoilageReports?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <h3 className="text-red-800 font-bold mb-2">⚠️ Spoilage Reported</h3>
            {spoilageReports.map((r, i) => (
              <div key={i} className="text-sm text-red-700">
                <strong>Stage:</strong> {r.stage} — {r.condition}
                {r.txHash && <div className="hash-text mt-0.5">TX: {shortHash(r.txHash)}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="card">
          <h2 className="section-title mb-5">Supply Chain Journey</h2>
          <div className="relative">
            {stages.map((stage, i) => (
              <div key={i} className="flex gap-4 mb-5 last:mb-0 relative">
                {i < stages.length - 1 && <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-green-200" />}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-white text-sm border-2 border-white shadow ${conditionColor(stage.condition)}`}>
                  {stageIcon(stage.stage)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{stage.stage}</span>
                    <span className={conditionBadgeClass(stage.condition)}>{stage.condition}</span>
                    <span className="text-xs text-gray-400">{formatDate(stage.timestamp)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    {stage.participant?.organization && (
                      <div><MapPin className="w-3 h-3 inline mr-1" />{stage.participant.organization}</div>
                    )}
                    {stage.location && <div>📍 {stage.location}</div>}
                    {stage.temperature != null && (
                      <div><Thermometer className="w-3 h-3 inline mr-1" />{stage.temperature}°C</div>
                    )}
                    {stage.txHash && (
                      <div><Hash className="w-3 h-3 inline mr-1" /><span className="hash-text">{shortHash(stage.txHash)}</span></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 pb-4">
          Powered by FoodTrace Blockchain Supply Chain System
        </div>
      </div>
    </div>
  );
}
