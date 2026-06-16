import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Marina from '../models/Marina.js';
import { generateToken } from '../utils/generateToken.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['owner', 'manager', 'staff']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role, marinaName, marinaSlug } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      let marina = null;
      const userRole = role || 'owner';

      if (userRole === 'owner' && marinaName) {
        const slug = marinaSlug || marinaName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        marina = await Marina.create({
          name: marinaName,
          slug,
          owner: null,
        });
      }

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        marina: marina?._id || req.body.marinaId || null,
      });

      if (marina) {
        marina.owner = user._id;
        await marina.save();
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        marina: marina || user.marina,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).populate('marina');

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        marina: user.marina,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

router.get('/users', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const users = await User.find({ marina: req.user.marina._id || req.user.marina }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff',
      marina: req.user.marina._id || req.user.marina,
      phone,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', protect, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { name, role, phone, isActive } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, marina: req.user.marina._id || req.user.marina },
      { name, role, phone, isActive },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
