import express from 'express';
import Marina from '../models/Marina.js';
import Boat from '../models/Boat.js';
import Reservation from '../models/Reservation.js';
import Customer from '../models/Customer.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const marinas = await Marina.find({ isActive: true }).select('name slug description city state logo');
    res.json(marinas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const marina = await Marina.findOne({ slug: req.params.slug, isActive: true });
    if (!marina) return res.status(404).json({ message: 'Marina not found' });

    const boats = await Boat.find({ marina: marina._id, isActive: true });
    res.json({ marina, boats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    if (req.user.marina) {
      const marina = await Marina.findById(req.user.marina._id || req.user.marina).populate('owner', 'name email');
      return res.json(marina ? [marina] : []);
    }
    const marinas = await Marina.find().populate('owner', 'name email');
    res.json(marinas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const marina = await Marina.findById(req.params.id).populate('owner', 'name email');
    if (!marina) return res.status(404).json({ message: 'Marina not found' });
    res.json(marina);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const marina = await Marina.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!marina) return res.status(404).json({ message: 'Marina not found' });
    res.json(marina);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/dashboard', protect, async (req, res) => {
  try {
    const marinaId = req.params.id;
    const [boats, reservations, customers, revenue] = await Promise.all([
      Boat.countDocuments({ marina: marinaId, isActive: true }),
      Reservation.countDocuments({ marina: marinaId, status: { $nin: ['cancelled'] } }),
      Customer.countDocuments({ marina: marinaId }),
      Reservation.aggregate([
        { $match: { marina: marinaId, status: { $in: ['confirmed', 'checked_in', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const upcoming = await Reservation.find({
      marina: marinaId,
      startDate: { $gte: new Date() },
      status: { $nin: ['cancelled'] },
    })
      .populate('boat', 'name type')
      .populate('customer', 'firstName lastName email')
      .sort({ startDate: 1 })
      .limit(5);

    const recentReservations = await Reservation.find({ marina: marinaId })
      .populate('boat', 'name')
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        boats,
        reservations,
        customers,
        revenue: revenue[0]?.total || 0,
      },
      upcoming,
      recentReservations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
