import mongoose from 'mongoose';

const boatSchema = new mongoose.Schema(
  {
    marina: { type: mongoose.Schema.Types.ObjectId, ref: 'Marina', required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['pontoon', 'fishing', 'ski', 'yacht', 'kayak', 'jet_ski', 'other'],
      default: 'pontoon',
    },
    description: { type: String, default: '' },
    capacity: { type: Number, default: 6 },
    length: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    dailyRate: { type: Number, required: true },
    images: [{ type: String }],
    features: [{ type: String }],
    turnaroundHours: { type: Number, default: 2 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Boat', boatSchema);
