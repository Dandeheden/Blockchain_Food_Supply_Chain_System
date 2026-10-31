import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowRightLeft, Thermometer, Info } from 'lucide-react';

const STAGES = ['Processor','Distributor','Retailer','Delivered'];
const CONDITIONS = ['Good','Warning','Spoiled'];

export default function UpdateStage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [oracleReading, setOracleReading] = useState(null);
  const [form, setForm] = useState({
    batchId:'', stage: STAGES[0], location:'', condition:'Good',
    temperature:'', notes:'', sensorId:''
  });

  useEffect(() => {
    api.get('/oracle/sensors').then(r => setSensors(r.data.sensors || [])).catch(() => {});
  }, []);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const fetchOracleReading = async () => {
    try {
      const payload = { sensorId: form.sensorId || undefined };
      if (form.temperature) payload.temperature = Number(form.temperature);
      const res = await api.post('/oracle/reading', payload);
      setOracleReading(res.data.reading);
      setForm(p => ({ ...p, temperature: res.data.reading.temperature }));
      toast.success('Oracle reading received (SIMULATED)');
    } catch { toast.error('Failed to fetch oracle reading.'); }
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        temperature: form.temperature !== '' ? Number(form.temperature) : undefined,
        oracleData: { isSimulated: true, sensorId: form.sensorId || 'manual', rawData: oracleReading },
      };
      const res = await api.post('/stages', payload);
      setTxResult(res.data.blockchain);
      toast.success(`Stage updated to ${form.stage}!`);
      setTimeout(() => navigate(`/batch/${form.batchId}`), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stage.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Update Supply Chain Stage</h1>
          <p className="text-gray-500 text-sm mt-0.5">Record the product's progress through the supply chain</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">All updates are recorded on the blockchain and cannot be edited. Corrections must be submitted as new records.</p>
      </div>

      {txResult && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="font-semibold text-green-800 mb-2">✅ Stage recorded on Blockchain!</div>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">TX Hash:</span> <span className="hash-text">{txResult.txHash}</span></div>
            <div><span className="font-medium">Block:</span> {txResult.blockNumber}</div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label htmlFor="us-batchId" className="label">Batch ID *</label>
          <input id="us-batchId" name="batchId" value={form.batchId} onChange={handle}
            className="input font-mono" placeholder="BATCH-TOM-ABC123" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="us-stage" className="label">Stage *</label>
            <select id="us-stage" name="stage" value={form.stage} onChange={handle} className="input">
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="us-condition" className="label">Condition *</label>
            <select id="us-condition" name="condition" value={form.condition} onChange={handle} className="input">
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="us-location" className="label">Location *</label>
          <input id="us-location" name="location" value={form.location} onChange={handle}
            className="input" placeholder="Warehouse, City, State" required />
        </div>

        {/* Oracle / Temperature */}
        <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-sm text-amber-800">Temperature Reading (Simulated Oracle)</span>
          </div>
          <p className="text-xs text-amber-600">⚠️ This oracle is SIMULATED. In production, a real oracle (e.g., Chainlink) would bring verified sensor data on-chain.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="us-sensor" className="label text-xs">Select Sensor</label>
              <select id="us-sensor" name="sensorId" value={form.sensorId} onChange={handle} className="input text-sm">
                <option value="">-- Manual Entry --</option>
                {sensors.map(s => <option key={s.id} value={s.id}>{s.id} ({s.location})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="us-temp" className="label text-xs">Temperature (°C)</label>
              <input id="us-temp" name="temperature" type="number" step="0.1" value={form.temperature}
                onChange={handle} className="input text-sm" placeholder="22.5" />
            </div>
          </div>
          <button type="button" onClick={fetchOracleReading}
            className="text-sm text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors">
            Get Simulated Reading
          </button>
          {oracleReading && (
            <div className="text-xs text-amber-700 font-mono bg-white rounded-lg p-2 border border-amber-200">
              <div>📡 Sensor: {oracleReading.sensorId}</div>
              <div>🌡️ Temp: {oracleReading.temperature}°C | Humidity: {oracleReading.humidity}%</div>
              <div>🕐 Time: {oracleReading.timestamp}</div>
              {oracleReading.warning && <div className="text-red-500 mt-1">{oracleReading.warning}</div>}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="us-notes" className="label">Notes</label>
          <textarea id="us-notes" name="notes" value={form.notes} onChange={handle}
            className="input h-24 resize-none" placeholder="Storage conditions, transportation details, quality observations..." />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
            {loading ? 'Recording on Blockchain...' : 'Update Stage'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
