import { useAuth } from '../context/AuthContext';
import { Copy, Check, Code } from 'lucide-react';
import { useState } from 'react';

export default function Widget() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const slug = user?.marina?.slug || 'your-marina';

  const getWidgetHost = () => {
    if (import.meta.env.DEV) {
      return 'http://localhost:5174';
    }

    const widgetHost = import.meta.env.VITE_WIDGET_URL?.trim();
    return widgetHost ? widgetHost : null;
  };

  const widgetHost = getWidgetHost();
  const widgetUrl = widgetHost ? `${widgetHost.replace(/\/+$/, '')}/?marina=${encodeURIComponent(slug)}` : null;
  const embedCode = widgetUrl
    ? `<iframe src="${widgetUrl}" width="100%" height="700" frameborder="0" style="border:none;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);"></iframe>`
    : '';
  const showWidgetPreview = Boolean(widgetUrl);

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Embeddable Booking Widget</h1>
        <p className="text-slate-600 text-sm mt-1">Embed Lake Pass booking on your marina website</p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Code className="w-5 h-5 text-lake-600" /> Embed Code
        </h2>
        <p className="text-sm text-slate-600">
          Copy and paste this code into your marina website to enable online boat bookings.
        </p>
        <div className="relative">
          <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs sm:text-sm overflow-x-auto font-mono">{embedCode}</pre>
          <button onClick={copyCode} className="absolute top-3 right-3 btn-secondary text-xs hover:bg-slate-100 transition-colors">
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Widget Preview</h2>
        <p className="text-xs sm:text-sm text-slate-600">This is how the widget appears on your website:</p>
        {showWidgetPreview ? (
          <div className="bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg overflow-hidden">
            <iframe
              src={widgetUrl}
              width="100%"
              height="700"
              style={{ border: 'none', borderRadius: '12px' }}
              title="Booking Widget Preview"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="font-semibold">Widget URL not configured</p>
            <p className="text-sm text-amber-900/80 mt-2">
              Your widget preview is unavailable because no production widget URL is set. Please configure <code className="rounded bg-slate-100 px-1 py-0.5">VITE_WIDGET_URL</code> in <code className="rounded bg-slate-100 px-1 py-0.5">client/.env.production</code>.
            </p>
          </div>
        )}
      </div>

      {showWidgetPreview ? (
        <div className="card p-6 bg-gradient-to-br from-lake-50 to-blue-50 border-lake-200">
          <h3 className="font-semibold text-lake-900">Direct Link</h3>
          <p className="text-sm text-lake-700 mt-2">
            Share this link: <a href={widgetUrl} target="_blank" rel="noreferrer" className="font-semibold underline hover:text-lake-800 transition-colors">{widgetUrl}</a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
