import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Anchor, Ship, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { formatCurrency, boatTypes } from '../utils/format';

const api = axios.create({ baseURL: '/api' });

export default function ConsumerBooking() {
  const { slug } = useParams();
  const [marinas, setMarinas] = useState([]);
  const [selectedMarina, setSelectedMarina] = useState(null);
  const [boats, setBoats] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [availability, setAvailability] = useState(null);
  const [customer, setCustomer] = useState({
    firstName: '', lastName: '', email: '', phone: '', licenseNumber: '',
  });
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/marinas/public').then((res) => {
      setMarinas(res.data);
      if (slug) {
        const m = res.data.find((x) => x.slug === slug);
        if (m) selectMarina(m);
      }
    });
  }, [slug]);

  const selectMarina = async (marina) => {
    setSelectedMarina(marina);
    const { data } = await api.get(`/marinas/public/${marina.slug}`);
    setSelectedMarina(data.marina);
    setBoats(data.boats);
    setStep(2);
  };

  const selectBoat = (boat) => {
    setSelectedBoat(boat);
    setStep(3);
  };

  const checkAvailability = async () => {
    setLoading(true);
    const { data } = await api.get('/reservations/public/check', {
      params: { boatId: selectedBoat._id, ...dates },
    });
    setAvailability(data);
    setLoading(false);
    if (data.available) setStep(4);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/reservations/public', {
        marinaId: selectedMarina._id,
        boatId: selectedBoat._id,
        customerData: customer,
        ...dates,
        source: slug ? 'widget' : 'consumer_app',
      });
      setReservation(data);
      setStep(5);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const payDeposit = async () => {
    setLoading(true);
    await api.post('/payments/confirm-mock', {
      reservationId: reservation._id,
      paymentType: 'deposit',
    });
    setStep(6);
    setLoading(false);
  };

  const days = dates.startDate && dates.endDate
    ? Math.max(1, Math.ceil((new Date(dates.endDate) - new Date(dates.startDate)) / 86400000))
    : 0;
  const total = selectedBoat ? days * selectedBoat.dailyRate : 0;
  const deposit = Math.round(total * 0.25);

  return (
    <div className="min-h-screen bg-gradient-to-b from-lake-50 to-white">
      <header className="bg-lake-900 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
          <Anchor className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Lake Pass</h1>
            <p className="text-lake-200 text-sm">Book your perfect day on the water</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Marina', 'Boat', 'Dates', 'Details', 'Payment'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-lake-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="text-sm text-slate-600 hidden sm:inline">{label}</span>
              {i < 4 && <div className="w-8 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Marina */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Choose Your Marina</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marinas.map((m) => (
                <button key={m._id} onClick={() => selectMarina(m)} className="card p-6 text-left hover:shadow-lg transition-shadow hover:border-lake-300">
                  <h3 className="font-semibold text-lg">{m.name}</h3>
                  <p className="text-sm text-slate-500">{m.city}, {m.state}</p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{m.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Boat */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-sm text-lake-600 mb-4 hover:underline">← Change marina</button>
            <h2 className="text-xl font-bold mb-1">{selectedMarina?.name}</h2>
            <p className="text-slate-500 mb-6">Select a boat to rent</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boats.map((boat) => (
                <button key={boat._id} onClick={() => selectBoat(boat)} className="card overflow-hidden text-left hover:shadow-lg transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-lake-400 to-lake-600 flex items-center justify-center">
                    <Ship className="w-12 h-12 text-white/80" />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{boat.name}</h3>
                        <p className="text-sm text-slate-500">{boatTypes[boat.type]} · {boat.capacity} guests</p>
                      </div>
                      <span className="font-bold text-lake-600">{formatCurrency(boat.dailyRate)}/day</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Dates */}
        {step === 3 && (
          <div className="card p-8 max-w-md mx-auto">
            <button onClick={() => setStep(2)} className="text-sm text-lake-600 mb-4 hover:underline">← Change boat</button>
            <h2 className="text-xl font-bold mb-1">{selectedBoat?.name}</h2>
            <p className="text-slate-500 mb-6 flex items-center gap-2"><Calendar className="w-4 h-4" /> Select rental dates</p>
            <div className="space-y-4">
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input" value={dates.startDate} onChange={(e) => setDates({ ...dates, startDate: e.target.value })} required />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" className="input" value={dates.endDate} onChange={(e) => setDates({ ...dates, endDate: e.target.value })} required />
              </div>
              {days > 0 && (
                <div className="bg-lake-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">{days} day{days > 1 ? 's' : ''} × {formatCurrency(selectedBoat.dailyRate)}</p>
                  <p className="text-xl font-bold text-lake-700">{formatCurrency(total)}</p>
                </div>
              )}
              {availability && !availability.available && (
                <p className="text-red-600 text-sm">{availability.reason}</p>
              )}
              <button onClick={checkAvailability} className="btn-primary w-full" disabled={!dates.startDate || !dates.endDate || loading}>
                {loading ? 'Checking...' : 'Check Availability & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Customer Details */}
        {step === 4 && (
          <div className="card p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-6">Your Information</h2>
            <form onSubmit={submitBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="label">Boating License #</label>
                <input className="input" value={customer.licenseNumber} onChange={(e) => setCustomer({ ...customer, licenseNumber: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Creating reservation...' : 'Continue to Payment'}
              </button>
            </form>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && reservation && (
          <div className="card p-8 max-w-md mx-auto text-center">
            <CreditCard className="w-12 h-12 text-lake-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Pay Deposit</h2>
            <p className="text-slate-500 mb-6">Secure your booking with a {formatCurrency(deposit)} deposit</p>
            <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span>Boat</span><span className="font-medium">{selectedBoat?.name}</span></div>
              <div className="flex justify-between"><span>Total</span><span className="font-medium">{formatCurrency(reservation.totalAmount)}</span></div>
              <div className="flex justify-between text-lake-700 font-bold"><span>Deposit Due</span><span>{formatCurrency(reservation.depositAmount)}</span></div>
            </div>
            <button onClick={payDeposit} className="btn-primary w-full" disabled={loading}>
              {loading ? 'Processing...' : `Pay ${formatCurrency(reservation.depositAmount)} Deposit`}
            </button>
            <p className="text-xs text-slate-400 mt-4">Demo mode: payment is simulated without real Stripe charges</p>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === 6 && (
          <div className="card p-8 max-w-md mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-slate-500 mb-6">Your reservation at {selectedMarina?.name} is confirmed.</p>
            <div className="bg-green-50 p-4 rounded-lg text-sm text-left space-y-1">
              <p><strong>Boat:</strong> {selectedBoat?.name}</p>
              <p><strong>Dates:</strong> {dates.startDate} to {dates.endDate}</p>
              <p><strong>Total:</strong> {formatCurrency(reservation?.totalAmount)}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
