import { useAuth } from '../context/AuthContext';
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
  const showWidgetPreview = Boolean(widgetUrl);

  const copyCode = () => {
    if (!widgetUrl) return;
    navigator.clipboard.writeText(widgetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Booking Widget</h1>
        <p className="text-slate-600 text-sm mt-1">Preview the widget and share the booking link.</p>
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
          <p className="text-sm text-lake-700 mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="break-all">{widgetUrl}</span>
            <button
              type="button"
              onClick={copyCode}
              className="btn-secondary text-xs w-full sm:w-auto"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </p>
        </div>
      ) : null}
    </div>
  );
}
