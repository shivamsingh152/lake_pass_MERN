import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    marina: { type: mongoose.Schema.Types.ObjectId, ref: 'Marina', required: true },
    boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalAmount: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    damageFee: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'deposit_paid', 'paid', 'refunded', 'partial_refund'],
      default: 'unpaid',
    },
    stripePaymentIntentId: { type: String, default: '' },
    stripeDepositIntentId: { type: String, default: '' },
    notes: { type: String, default: '' },
    source: {
      type: String,
      enum: ['dashboard', 'consumer_app', 'widget', 'phone'],
      default: 'dashboard',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

reservationSchema.index({ marina: 1, startDate: 1, endDate: 1 });
reservationSchema.index({ boat: 1, startDate: 1, endDate: 1 });

export default mongoose.model('Reservation', reservationSchema);
