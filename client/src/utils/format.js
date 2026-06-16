export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDateRange = (start, end) =>
  `${formatDate(start)} – ${formatDate(end)}`;

export const boatTypes = {
  pontoon: 'Pontoon',
  fishing: 'Fishing',
  ski: 'Ski Boat',
  yacht: 'Yacht',
  kayak: 'Kayak',
  jet_ski: 'Jet Ski',
  other: 'Other',
};

export const roleLabels = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
};
