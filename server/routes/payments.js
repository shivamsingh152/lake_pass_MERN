import express from 'express';
import Stripe from 'stripe';
import Reservation from '../models/Reservation.js';
import Customer from '../models/Customer.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

router.post('/create-payment-intent', async (req, res) => {
  try {
    const stripe = getStripe();
    const { reservationId, paymentType = 'deposit' } = req.body;

    const reservation = await Reservation.findById(reservationId)
      .populate('marina', 'name settings stripeAccountId')
      .populate('customer', 'email firstName lastName');

    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    const amount =
      paymentType === 'deposit' ? reservation.depositAmount : reservation.totalAmount - reservation.depositAmount;

    if (!stripe) {
      await Reservation.findByIdAndUpdate(reservationId, {
        paymentStatus: paymentType === 'deposit' ? 'deposit_paid' : 'paid',
        status: 'confirmed',
        stripePaymentIntentId: `mock_pi_${Date.now()}`,
      });
      return res.json({
        mock: true,
        clientSecret: 'mock_secret',
        message: 'Stripe not configured - payment simulated',
        amount,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: reservation.marina.settings.currency || 'usd',
      metadata: {
        reservationId: reservation._id.toString(),
        paymentType,
      },
      receipt_email: reservation.customer.email,
    });

    if (paymentType === 'deposit') {
      await Reservation.findByIdAndUpdate(reservationId, {
        stripeDepositIntentId: paymentIntent.id,
      });
    } else {
      await Reservation.findByIdAndUpdate(reservationId, {
        stripePaymentIntentId: paymentIntent.id,
      });
    }

    res.json({ clientSecret: paymentIntent.client_secret, amount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/confirm-mock', async (req, res) => {
  try {
    const { reservationId, paymentType = 'deposit' } = req.body;
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    const updates = {
      status: 'confirmed',
      paymentStatus: paymentType === 'full' ? 'paid' : 'deposit_paid',
    };

    const updated = await Reservation.findByIdAndUpdate(reservationId, updates, { new: true })
      .populate('boat', 'name')
      .populate('customer', 'firstName lastName email');

    if (paymentType === 'full' || paymentType === 'deposit') {
      await Customer.findByIdAndUpdate(reservation.customer, {
        $inc: { totalSpent: paymentType === 'full' ? reservation.totalAmount : reservation.depositAmount },
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/damage-fee', protect, async (req, res) => {
  try {
    const { reservationId, amount } = req.body;
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    const updated = await Reservation.findByIdAndUpdate(
      reservationId,
      { damageFee: amount || reservation.damageFee },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
