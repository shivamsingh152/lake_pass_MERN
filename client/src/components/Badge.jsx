export default function Badge({ status }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    checked_in: 'bg-green-100 text-green-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800',
    unpaid: 'bg-red-100 text-red-800',
    deposit_paid: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    maintenance: 'bg-orange-100 text-orange-800',
    blocked: 'bg-red-100 text-red-800',
    locked_deal: 'bg-purple-100 text-purple-800',
    holiday: 'bg-indigo-100 text-indigo-800',
  };

  const label = status?.replace(/_/g, ' ');

  return (
    <span className={`badge capitalize ${colors[status] || 'bg-slate-100 text-slate-800'}`}>
      {label}
    </span>
  );
}
