import express from 'express';
import Customer from '../models/Customer.js';
import Reservation from '../models/Reservation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const marinaId = req.query.marina || req.user.marina?._id || req.user.marina;
    const { search } = req.query;
    let query = { marina: marinaId };

    let customers = await Customer.find(query).sort({ lastName: 1 });

    if (search) {
      const term = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.firstName.toLowerCase().includes(term) ||
          c.lastName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.includes(term)
      );
    }

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const rentals = await Reservation.find({ customer: customer._id })
      .populate('boat', 'name type dailyRate')
      .sort({ startDate: -1 });

    res.json({ customer, rentals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('owner', 'manager', 'staff'), async (req, res) => {
  try {
    const marinaId = req.body.marina || req.user.marina?._id || req.user.marina;
    const customer = await Customer.create({ ...req.body, marina: marinaId });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('owner', 'manager', 'staff'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
