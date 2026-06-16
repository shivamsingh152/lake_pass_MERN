import express from 'express';
import Availability from '../models/Availability.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const marinaId = req.query.marina || req.user.marina?._id || req.user.marina;
    const boatId = req.query.boat;
    const query = { marina: marinaId };
    if (boatId) query.boat = boatId;

    const items = await Availability.find(query)
      .populate('boat', 'name type')
      .sort({ startDate: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('owner', 'manager', 'staff'), async (req, res) => {
  try {
    const marinaId = req.body.marina || req.user.marina?._id || req.user.marina;
    const item = await Availability.create({
      ...req.body,
      marina: marinaId,
      createdBy: req.user._id,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.json({ message: 'Availability block removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
