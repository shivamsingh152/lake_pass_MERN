import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Availability from './pages/Availability';
import Reservations from './pages/Reservations';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Widget from './pages/Widget';
import ConsumerBooking from './pages/ConsumerBooking';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/book" element={<ConsumerBooking />} />
      <Route path="/book/:slug" element={<ConsumerBooking />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="availability" element={<Availability />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="widget" element={<Widget />} />
      </Route>
    </Routes>
  );
}
