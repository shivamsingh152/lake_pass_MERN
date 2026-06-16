import { useAuth } from '../context/AuthContext';
import { Copy, Check, Code } from 'lucide-react';
import { useState } from 'react';

export default function Widget() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const slug = user?.marina?.slug || 'your-marina';
  const widgetUrl = `http://localhost:5174?marina=${slug}`;
  const embedCode = `<iframe src="${widgetUrl}" width="100%" height="700" frameborder="0" style="border:none;border-radius:12px;"></iframe>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Embeddable Booking Widget</h1>
        <p className="text-slate-500">Embed Lake Pass booking on your marina website</p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Code className="w-5 h-5 text-lake-600" /> Embed Code
        </h2>
        <p className="text-sm text-slate-600">
          Copy and paste this code into your marina website to enable online boat bookings.
        </p>
        <div className="relative">
          <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">{embedCode}</pre>
          <button onClick={copyCode} className="absolute top-3 right-3 btn-secondary text-xs">
            {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Widget Preview</h2>
        <iframe
          src={widgetUrl}
          width="100%"
          height="700"
          style={{ border: 'none', borderRadius: '12px', background: '#f8fafc' }}
          title="Booking Widget Preview"
        />
      </div>

      <div className="card p-6 bg-lake-50 border-lake-200">
        <h3 className="font-semibold text-lake-900">Direct Link</h3>
        <p className="text-sm text-lake-700 mt-1">
          Share this link: <a href={widgetUrl} target="_blank" rel="noreferrer" className="underline">{widgetUrl}</a>
        </p>
      </div>
    </div>
  );
}
