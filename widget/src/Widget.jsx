import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from './utils/apiBase';

const api = axios.create({ baseURL: getApiBaseUrl() });

const boatTypes = {
  pontoon: 'Pontoon', fishing: 'Fishing', ski: 'Ski Boat', yacht: 'Yacht',
  kayak: 'Kayak', jet_ski: 'Jet Ski', other: 'Other',
};

const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

export default function Widget() {
  const params = new URLSearchParams(window.location.search);
  const marinaSlug = params.get('marina') || 'sunset-bay';

  const [marina, setMarina] = useState(null);
  const [boats, setBoats] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [step, setStep] = useState(1);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/marinas/public/${marinaSlug}`).then((res) => {
      setMarina(res.data.marina);
      setBoats(res.data.boats);
    }).catch(() => setError('Marina not found'));
  }, [marinaSlug]);

  const days = dates.startDate && dates.endDate
    ? Math.max(1, Math.ceil((new Date(dates.endDate) - new Date(dates.startDate)) / 86400000))
    : 0;

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const check = await api.get('/reservations/public/check', {
        params: { boatId: selectedBoat._id, ...dates },
      });
      if (!check.data.available) {
        setError(check.data.reason);
        setLoading(false);
        return;
      }

      const { data } = await api.post('/reservations/public', {
        marinaId: marina._id,
        boatId: selectedBoat._id,
        customerData: customer,
        ...dates,
        source: 'widget',
      });

      await api.post('/payments/confirm-mock', { reservationId: data._id, paymentType: 'deposit' });
      setReservation(data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (error && !marina) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!marina) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-lake-600 border-t-transparent mx-auto" /></div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-lake-900">{marina.name}</h1>
        <p className="text-sm text-slate-500">Book a boat online</p>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          {boats.map((boat) => (
            <button
              key={boat._id}
              onClick={() => { setSelectedBoat(boat); setStep(2); }}
              className="card p-4 w-full text-left hover:border-lake-400 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{boat.name}</p>
                  <p className="text-xs text-slate-500">{boatTypes[boat.type]} · {boat.capacity} guests</p>
                </div>
                <span className="font-bold text-lake-600">{formatCurrency(boat.dailyRate)}/day</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && selectedBoat && (
        <form onSubmit={handleBook} className="space-y-4">
          <button type="button" onClick={() => setStep(1)} className="text-sm text-lake-600 hover:underline">← Back</button>
          <h2 className="font-semibold">{selectedBoat.name}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start</label>
              <input type="date" className="input" value={dates.startDate} onChange={(e) => setDates({ ...dates, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">End</label>
              <input type="date" className="input" value={dates.endDate} onChange={(e) => setDates({ ...dates, endDate: e.target.value })} required />
            </div>
          </div>

          {days > 0 && (
            <p className="text-sm bg-lake-50 p-3 rounded-lg">
              {days} day{days > 1 ? 's' : ''} — <strong>{formatCurrency(days * selectedBoat.dailyRate)}</strong>
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input className="input" value={customer.firstName} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" value={customer.lastName} onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} required />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Booking...' : 'Book Now'}
          </button>
        </form>
      )}

      {step === 3 && reservation && (
        <div className="text-center space-y-4">
          <div className="text-4xl">✓</div>
          <h2 className="text-xl font-bold text-green-700">Booking Confirmed!</h2>
          <p className="text-sm text-slate-600">
            {selectedBoat.name} · {formatCurrency(reservation.totalAmount)}
          </p>
          <p className="text-xs text-slate-400">Deposit paid. See you on the water!</p>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 mt-6">Powered by Lake Pass</p>
    </div>
  );
}
