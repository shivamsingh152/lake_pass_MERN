import express from 'express';
import Reservation from '../models/Reservation.js';
import Customer from '../models/Customer.js';
import Boat from '../models/Boat.js';
import Marina from '../models/Marina.js';
import { protect, authorize } from '../middleware/auth.js';
import { checkBoatAvailability, calculateDays } from '../utils/availability.js';

const router = express.Router();

router.get('/public/check', async (req, res) => {
  try {
    const { boatId, startDate, endDate } = req.query;
    if (!boatId || !startDate || !endDate) {
      return res.status(400).json({ message: 'boatId, startDate, endDate required' });
    }
    const result = await checkBoatAvailability(boatId, startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const marinaId = req.query.marina || req.user.marina?._id || req.user.marina;
    const { status, search, start, end } = req.query;
    const query = { marina: marinaId };

    if (status) query.status = status;
    if (start && end) {
      query.$or = [{ startDate: { $lt: new Date(end) }, endDate: { $gt: new Date(start) } }];
    }

    let reservations = await Reservation.find(query)
      .populate('boat', 'name type dailyRate')
      .populate('customer', 'firstName lastName email phone')
      .sort({ startDate: -1 });

    if (search) {
      const term = search.toLowerCase();
      reservations = reservations.filter(
        (r) =>
          r.customer?.firstName?.toLowerCase().includes(term) ||
          r.customer?.lastName?.toLowerCase().includes(term) ||
          r.customer?.email?.toLowerCase().includes(term) ||
          r.boat?.name?.toLowerCase().includes(term)
      );
    }

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('boat')
      .populate('customer')
      .populate('marina', 'name settings');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const marinaId = req.body.marina || req.user.marina?._id || req.user.marina;
    const { boatId, customerId, customerData, startDate, endDate, notes, source } = req.body;

    const availability = await checkBoatAvailability(boatId, startDate, endDate);
    if (!availability.available) {
      return res.status(400).json({ message: availability.reason });
    }

    const boat = await Boat.findById(boatId);
    if (!boat) return res.status(404).json({ message: 'Boat not found' });

    const marina = await Marina.findById(marinaId);
    let customer;
    if (customerId) {
      customer = await Customer.findById(customerId);
    } else if (customerData) {
      customer = await Customer.findOneAndUpdate(
        { marina: marinaId, email: customerData.email },
        { ...customerData, marina: marinaId },
        { upsert: true, new: true }
      );
    }

    if (!customer) return res.status(400).json({ message: 'Customer required' });

    const days = calculateDays(startDate, endDate);
    const totalAmount = days * boat.dailyRate;
    const depositAmount = Math.round(totalAmount * (marina.settings.depositPercent / 100));

    const reservation = await Reservation.create({
      marina: marinaId,
      boat: boatId,
      customer: customer._id,
      startDate,
      endDate,
      totalAmount,
      depositAmount,
      damageFee: marina.settings.damageFee,
      notes,
      source: source || 'dashboard',
      createdBy: req.user?._id || null,
    });

    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { totalRentals: 1 },
    });

    const populated = await Reservation.findById(reservation._id)
      .populate('boat', 'name type')
      .populate('customer', 'firstName lastName email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/public', async (req, res) => {
  try {
    const { marinaId, boatId, customerData, startDate, endDate, notes, source } = req.body;

    const availability = await checkBoatAvailability(boatId, startDate, endDate);
    if (!availability.available) {
      return res.status(400).json({ message: availability.reason });
    }

    const boat = await Boat.findById(boatId);
    const marina = await Marina.findById(marinaId);
    if (!boat || !marina) return res.status(404).json({ message: 'Boat or marina not found' });

    const customer = await Customer.findOneAndUpdate(
      { marina: marinaId, email: customerData.email },
      { ...customerData, marina: marinaId },
      { upsert: true, new: true }
    );

    const days = calculateDays(startDate, endDate);
    const totalAmount = days * boat.dailyRate;
    const depositAmount = Math.round(totalAmount * (marina.settings.depositPercent / 100));

    const reservation = await Reservation.create({
      marina: marinaId,
      boat: boatId,
      customer: customer._id,
      startDate,
      endDate,
      totalAmount,
      depositAmount,
      damageFee: marina.settings.damageFee,
      notes,
      source: source || 'consumer_app',
      status: 'pending',
    });

    await Customer.findByIdAndUpdate(customer._id, { $inc: { totalRentals: 1 } });

    const populated = await Reservation.findById(reservation._id)
      .populate('boat', 'name type dailyRate')
      .populate('customer', 'firstName lastName email')
      .populate('marina', 'name settings');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('owner', 'manager', 'staff'), async (req, res) => {
  try {
    const { status, notes, paymentStatus, startDate, endDate } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    if (startDate && endDate) {
      const existing = await Reservation.findById(req.params.id);
      const availability = await checkBoatAvailability(existing.boat, startDate, endDate, req.params.id);
      if (!availability.available) {
        return res.status(400).json({ message: availability.reason });
      }
      updates.startDate = startDate;
      updates.endDate = endDate;
    }

    const reservation = await Reservation.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('boat', 'name type')
      .populate('customer', 'firstName lastName email');

    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
