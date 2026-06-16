import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import api from '../api/api';
import { formatCurrency, formatDateRange } from '../utils/format';
import Badge from '../components/Badge';

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/customers/${id}`).then((res) => setData(res.data));
  }, [id]);

  if (!data) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-lake-600 border-t-transparent" /></div>;
  }

  const { customer, rentals } = data;

  return (
    <div className="space-y-6">
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-lake-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="w-20 h-20 bg-lake-100 rounded-full flex items-center justify-center text-2xl font-bold text-lake-700 mb-4">
            {customer.firstName[0]}{customer.lastName[0]}
          </div>
          <h1 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h1>
          <p className="text-slate-500">{customer.email}</p>
          <p className="text-slate-500">{customer.phone}</p>
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Rentals</p>
              <p className="text-xl font-bold">{customer.totalRentals}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="text-xl font-bold">{formatCurrency(customer.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-lake-600" /> Insurance & License
          </h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-slate-500">License</dt><dd className="font-medium">{customer.licenseNumber || '—'}</dd></div>
            <div><dt className="text-slate-500">Provider</dt><dd className="font-medium">{customer.insuranceProvider || '—'}</dd></div>
            <div><dt className="text-slate-500">Policy #</dt><dd className="font-medium">{customer.insurancePolicy || '—'}</dd></div>
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-lake-600" /> Contact Info
          </h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-slate-500">Address</dt><dd className="font-medium">{customer.address || '—'}</dd></div>
            <div><dt className="text-slate-500">City</dt><dd className="font-medium">{customer.city ? `${customer.city}, ${customer.state} ${customer.zipCode}` : '—'}</dd></div>
            <div><dt className="text-slate-500">Notes</dt><dd className="font-medium">{customer.notes || '—'}</dd></div>
          </dl>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold">Rental History</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Boat</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Dates</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Amount</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rentals.map((r) => (
              <tr key={r._id}>
                <td className="p-4 font-medium">{r.boat?.name}</td>
                <td className="p-4 text-sm">{formatDateRange(r.startDate, r.endDate)}</td>
                <td className="p-4">{formatCurrency(r.totalAmount)}</td>
                <td className="p-4"><Badge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {rentals.length === 0 && <p className="p-6 text-slate-500 text-center">No rental history</p>}
      </div>
    </div>
  );
}
