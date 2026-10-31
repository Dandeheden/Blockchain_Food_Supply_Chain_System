import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, shortHash, stageIcon, conditionBadgeClass, statusBadgeClass, conditionColor } from '../utils/helpers';
import { ArrowLeft, MapPin, Thermometer, User, Hash, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BatchDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/batches/${batchId}`)
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load batch.'))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="text-center py-16 text-gray-400">
      <p>Batch not found.</p>
      <button onClick={() => navigate('/track')} className="btn-secondary mt-4">Back to Track</button>
    </div>
  );

  const { batch, stages, spoilageReports, blockchain } = data;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-green-900">{batch.productName}</h1>
          <p className="hash-text">{batch.batchId}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => navigate(`/qrcode?batch=${batch.batchId}`)} className="btn-secondary text-xs">
            <QrCode className="w-4 h-4" /> QR Code
          </button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={statusBadgeClass(batch.status)}>{batch.status}</span>
        <span className="badge-info">{batch.currentStage}</span>
        <span className="badge-info">{batch.category}</span>
        {batch.status === 'Spoiled' && (
          <span className="badge-spoiled">⚠️ Spoilage Reported</span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Batch info card */}
        <div className="card">
          <h3 className="section-title mb-4">Batch Information</h3>
          <dl className="space-y-3 text-sm">
            {[
              ['Product', batch.productName],
              ['Category', batch.category],
              ['Quantity', `${batch.quantity} ${batch.unit}`],
              ['Farm Location', batch.farmLocation],
              ['Harvest Date', formatDate(batch.harvestDate).split(',')[0]],
              ['Safe Temp Range', `${batch.safeTemperatureMin}°C – ${batch.safeTemperatureMax}°C`],
              ['Registered', formatDate(batch.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-400">{label}</dt>
                <dd className="font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
          {batch.description && (
            <p className="mt-4 pt-4 border-t text-xs text-gray-500 italic">{batch.description}</p>
          )}
        </div>

        {/* Farmer info */}
        <div className="card">
          <h3 className="section-title mb-4">Registered By</h3>
          {batch.farmer ? (
            <dl className="space-y-3 text-sm">
              {[
                ['Name', batch.farmer.name],
                ['Organization', batch.farmer.organization || 'N/A'],
                ['Location', batch.farmer.location || 'N/A'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-gray-400">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : <p className="text-gray-400 text-sm">No farmer info.</p>}

          {batch.contractTxHash && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs font-semibold text-gray-500 mb-2">🔗 Blockchain Registration</div>
              <div className="text-xs space-y-1">
                <div><span className="text-gray-400">TX Hash: </span><span className="hash-text">{shortHash(batch.contractTxHash)}</span></div>
                <div><span className="text-gray-400">Block: </span><span className="font-mono">#{batch.contractBlockNumber}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spoilage alerts */}
      {spoilageReports?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h3 className="text-red-800 font-bold mb-3">⚠️ Spoilage Reports ({spoilageReports.length})</h3>
          <p className="text-xs text-red-600 mb-3">
            Blockchain records self-reported data only. An investigation is required to determine actual fault.
          </p>
          {spoilageReports.map((r, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-red-100 mb-2 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-red-700">Stage: {r.stage}</span>
                <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700">{r.description}</p>
              {r.temperature != null && <p className="text-xs text-gray-500 mt-1">Temp reported: {r.temperature}°C</p>}
              {r.txHash && <p className="hash-text mt-1">TX: {r.txHash}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <h3 className="section-title mb-6">Supply Chain Timeline</h3>
        <div className="relative">
          {stages.map((stage, i) => (
            <div key={i} className="flex gap-4 mb-6 last:mb-0 relative">
              {i < stages.length - 1 && (
                <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-green-200" />
              )}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm text-white text-sm ${conditionColor(stage.condition)}`}>
                {stageIcon(stage.stage)}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{stage.stage}</span>
                  <span className={conditionBadgeClass(stage.condition)}>{stage.condition}</span>
                  <span className="text-xs text-gray-400">{formatDate(stage.timestamp)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                  {stage.participant && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{stage.participant.name} ({stage.participant.role})</span>
                  )}
                  {stage.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{stage.location}</span>
                  )}
                  {stage.temperature != null && (
                    <span className={`flex items-center gap-1 ${
                      stage.temperature > batch.safeTemperatureMax || stage.temperature < batch.safeTemperatureMin
                        ? 'text-red-600 font-bold' : ''
                    }`}>
                      <Thermometer className="w-3 h-3" />{stage.temperature}°C
                      {(stage.temperature > batch.safeTemperatureMax || stage.temperature < batch.safeTemperatureMin) && ' ⚠️'}
                    </span>
                  )}
                </div>
                {stage.notes && <p className="text-xs text-gray-500 mt-2 italic">"{stage.notes}"</p>}
                {stage.txHash && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="hash-text">{shortHash(stage.txHash)}</span>
                    {stage.blockNumber && <span className="text-gray-400 ml-1">Block #{stage.blockNumber}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* On-chain records */}
      {blockchain?.history?.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4">🔗 On-Chain Records</h3>
          <p className="text-xs text-gray-400 mb-4">Live data read from the Hardhat blockchain node.</p>
          <div className="space-y-2">
            {blockchain.history.map((h, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-semibold">{h.stage}</span>
                  <span className="text-gray-400">{h.timestamp}</span>
                </div>
                <div className="hash-text">DataHash: {h.dataHash}</div>
                <div className="text-gray-500">Participant: {h.participant}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
