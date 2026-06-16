import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    marina: { type: mongoose.Schema.Types.ObjectId, ref: 'Marina' },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    insuranceProvider: { type: String, default: '' },
    insurancePolicy: { type: String, default: '' },
    insuranceExpiry: { type: Date, default: null },
    notes: { type: String, default: '' },
    totalRentals: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ marina: 1, email: 1 });

export default mongoose.model('Customer', customerSchema);
