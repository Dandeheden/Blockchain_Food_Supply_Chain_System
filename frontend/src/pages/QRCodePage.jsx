import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { QrCode, Download, Search, Copy } from 'lucide-react';

export default function QRCodePage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('batch') || '');
  const [activeBatchId, setActiveBatchId] = useState(searchParams.get('batch') || '');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQR = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/qrcode/${id}`);
      setQrData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Batch not found.');
      setQrData(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeBatchId) fetchQR(activeBatchId);
  }, [activeBatchId]);

  const handleSearch = e => {
    e.preventDefault();
    setActiveBatchId(search.trim());
  };

  const copyUrl = () => {
    if (!qrData?.url) return;
    navigator.clipboard.writeText(qrData.url);
    toast.success('URL copied to clipboard!');
  };

  const downloadQR = () => {
    const svgEl = document.querySelector('#qr-code-container svg');
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${activeBatchId}-qrcode.svg`;
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-green-900">QR Code Generator</h1>
        <p className="text-gray-500 text-sm mt-0.5">Generate a QR code for any batch. Scanning it shows the public tracking page.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          id="qr-search-input" value={search} onChange={e => setSearch(e.target.value)}
          className="input flex-1 font-mono" placeholder="Enter Batch ID"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
          Generate
        </button>
      </form>

      {qrData && (
        <div className="card text-center space-y-5">
          <h3 className="section-title">{activeBatchId}</h3>

          <div id="qr-code-container" className="flex justify-center p-6 bg-white rounded-2xl border-2 border-green-100">
            <QRCodeSVG
              value={qrData.url}
              size={220}
              fgColor="#14532d"
              bgColor="#ffffff"
              level="H"
            />
          </div>

          <div className="flex items-center gap-2">
            <input readOnly value={qrData.url} className="input text-xs text-gray-500 bg-gray-50 flex-1" />
            <button onClick={copyUrl} className="btn-secondary p-2.5 flex-shrink-0" title="Copy URL">
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={downloadQR} className="btn-secondary">
              <Download className="w-4 h-4" /> Download SVG
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Scanning this QR code opens a public product page showing batch history without exposing private user details.
          </p>
        </div>
      )}

      {!qrData && !loading && (
        <div className="card flex flex-col items-center py-16 text-gray-300">
          <QrCode className="w-16 h-16 mb-4" />
          <p>Enter a batch ID above to generate its QR code</p>
        </div>
      )}
    </div>
  );
}
