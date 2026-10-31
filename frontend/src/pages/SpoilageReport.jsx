import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Info } from 'lucide-react';

const STAGES = ['Farmer','Processor','Distributor','Retailer','Customer'];
const SEVERITIES = ['Low','Medium','High','Critical'];

export default function SpoilageReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [form, setForm] = useState({
    batchId:'', stage:'Distributor', condition:'', temperature:'',
    description:'', severity:'Medium'
  });

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        temperature: form.temperature !== '' ? Number(form.temperature) : undefined,
      };
      const res = await api.post('/spoilage', payload);
      setTxResult(res.data.blockchain);
      toast.success('Spoilage report submitted and recorded on blockchain.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Report Spoilage</h1>
          <p className="text-gray-500 text-sm mt-0.5">Document a product spoilage or contamination incident</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Important:</strong> This report records your observation on the blockchain. The blockchain records
          WHEN and WHERE spoilage was reported — it does not automatically assign fault. An investigation is required.
          Blockchain cannot verify if submitted information is truthful.
        </div>
      </div>

      {txResult && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="font-semibold text-green-800 mb-2">✅ Report recorded on Blockchain!</div>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">TX Hash:</span> <span className="hash-text">{txResult.txHash}</span></div>
            <div><span className="font-medium">Block:</span> {txResult.blockNumber}</div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label htmlFor="sr-batchId" className="label">Batch ID *</label>
          <input id="sr-batchId" name="batchId" value={form.batchId} onChange={handle}
            className="input font-mono" placeholder="BATCH-TOM-ABC123" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sr-stage" className="label">Stage Where Discovered *</label>
            <select id="sr-stage" name="stage" value={form.stage} onChange={handle} className="input">
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sr-severity" className="label">Severity</label>
            <select id="sr-severity" name="severity" value={form.severity} onChange={handle} className="input">
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="sr-condition" className="label">Observed Condition *</label>
          <input id="sr-condition" name="condition" value={form.condition} onChange={handle}
            className="input" placeholder="e.g. Mold visible, foul odor, discoloration" required />
        </div>

        <div>
          <label htmlFor="sr-temperature" className="label">Storage Temperature at Discovery (°C)</label>
          <input id="sr-temperature" name="temperature" type="number" step="0.1" value={form.temperature}
            onChange={handle} className="input" placeholder="35.0" />
        </div>

        <div>
          <label htmlFor="sr-description" className="label">Detailed Description *</label>
          <textarea id="sr-description" name="description" value={form.description} onChange={handle}
            className="input h-28 resize-none"
            placeholder="Describe the spoilage in detail. Include timeline observations, storage conditions, handling notes..."
            required />
        </div>

        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          Once submitted, this report cannot be retracted. Submitting a false report is unethical and may have legal consequences.
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-danger">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            {loading ? 'Submitting...' : 'Submit Spoilage Report'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
