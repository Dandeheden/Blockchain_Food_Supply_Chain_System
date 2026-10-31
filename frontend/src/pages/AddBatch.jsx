import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Leaf } from 'lucide-react';

const CATEGORIES = ['vegetables','fruits','grains','dairy','meat','seafood','other'];
const SAFE_TEMP_DEFAULTS = {
  vegetables: { min:0,  max:10 },
  fruits:     { min:4,  max:12 },
  grains:     { min:10, max:25 },
  dairy:      { min:0,  max:4  },
  meat:       { min:-2, max:4  },
  seafood:    { min:-2, max:4  },
  other:      { min:0,  max:25 },
};

export default function AddBatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [form, setForm] = useState({
    productName: '', category: 'vegetables', quantity: '', unit: 'kg',
    farmLocation: '', harvestDate: '', description: '',
    safeTemperatureMin: 0, safeTemperatureMax: 10,
  });

  const handle = e => {
    const { name, value } = e.target;
    if (name === 'category' && SAFE_TEMP_DEFAULTS[value]) {
      setForm(p => ({ ...p, category: value, safeTemperatureMin: SAFE_TEMP_DEFAULTS[value].min, safeTemperatureMax: SAFE_TEMP_DEFAULTS[value].max }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/batches', form);
      setTxResult(res.data.blockchain);
      toast.success(`Batch ${res.data.batch.batchId} registered!`);
      setTimeout(() => navigate(`/batch/${res.data.batch.batchId}`), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to register batch.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Register New Batch</h1>
          <p className="text-gray-500 text-sm mt-0.5">Register a new food product batch on the blockchain</p>
        </div>
      </div>

      {txResult && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
            <Leaf className="w-4 h-4" /> Registered on Blockchain!
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div><span className="font-medium">Transaction Hash:</span> <span className="hash-text">{txResult.txHash}</span></div>
            <div><span className="font-medium">Block Number:</span> {txResult.blockNumber}</div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="ab-productName" className="label">Product Name *</label>
            <input id="ab-productName" name="productName" value={form.productName} onChange={handle}
              className="input" placeholder="e.g. Tomatoes, Rice, Milk" required />
          </div>

          <div>
            <label htmlFor="ab-category" className="label">Category *</label>
            <select id="ab-category" name="category" value={form.category} onChange={handle} className="input">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="ab-quantity" className="label">Quantity *</label>
              <input id="ab-quantity" name="quantity" type="number" min="1" value={form.quantity}
                onChange={handle} className="input" placeholder="100" required />
            </div>
            <div>
              <label htmlFor="ab-unit" className="label">Unit</label>
              <select id="ab-unit" name="unit" value={form.unit} onChange={handle} className="input">
                {['kg','g','liters','units','bags'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="ab-farmLocation" className="label">Farm Location *</label>
            <input id="ab-farmLocation" name="farmLocation" value={form.farmLocation} onChange={handle}
              className="input" placeholder="Village, District, State" required />
          </div>

          <div>
            <label htmlFor="ab-harvestDate" className="label">Harvest Date *</label>
            <input id="ab-harvestDate" name="harvestDate" type="date" value={form.harvestDate}
              onChange={handle} className="input" required />
          </div>

          <div>
            <label className="label">Safe Temp Range (°C)</label>
            <div className="flex gap-2 items-center">
              <input name="safeTemperatureMin" type="number" value={form.safeTemperatureMin}
                onChange={handle} className="input" placeholder="Min" />
              <span className="text-gray-400 text-sm">to</span>
              <input name="safeTemperatureMax" type="number" value={form.safeTemperatureMax}
                onChange={handle} className="input" placeholder="Max" />
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="ab-description" className="label">Description</label>
            <textarea id="ab-description" name="description" value={form.description} onChange={handle}
              className="input h-20 resize-none" placeholder="Additional notes about this batch..." />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? 'Registering on Blockchain...' : 'Register Batch'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
