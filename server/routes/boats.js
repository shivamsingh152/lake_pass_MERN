import express from 'express';
import Boat from '../models/Boat.js';
import Availability from '../models/Availability.js';
import Reservation from '../models/Reservation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/public/marina/:marinaId', async (req, res) => {
  try {
    const boats = await Boat.find({ marina: req.params.marinaId, isActive: true });
    res.json(boats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const marinaId = req.query.marina || req.user.marina?._id || req.user.marina;
    const boats = await Boat.find({ marina: marinaId }).sort({ name: 1 });
    res.json(boats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id);
    if (!boat) return res.status(404).json({ message: 'Boat not found' });
    res.json(boat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const marinaId = req.body.marina || req.user.marina?._id || req.user.marina;
    const boat = await Boat.create({ ...req.body, marina: marinaId });
    res.status(201).json(boat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const boat = await Boat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!boat) return res.status(404).json({ message: 'Boat not found' });
    res.json(boat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const boat = await Boat.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!boat) return res.status(404).json({ message: 'Boat not found' });
    res.json({ message: 'Boat removed', boat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/calendar', protect, async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = { boat: req.params.id };
    if (start && end) {
      query.$or = [{ startDate: { $lt: new Date(end) }, endDate: { $gt: new Date(start) } }];
    }

    const [reservations, availability] = await Promise.all([
      Reservation.find({ ...query, status: { $nin: ['cancelled'] } }).populate('customer', 'firstName lastName'),
      Availability.find(query),
    ]);

    res.json({ reservations, availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
