import mongoose from 'mongoose';

const marinaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stripeAccountId: { type: String, default: '' },
    settings: {
      depositPercent: { type: Number, default: 25 },
      damageFee: { type: Number, default: 500 },
      turnaroundHours: { type: Number, default: 2 },
      currency: { type: String, default: 'usd' },
      timezone: { type: String, default: 'America/Chicago' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Marina', marinaSchema);
