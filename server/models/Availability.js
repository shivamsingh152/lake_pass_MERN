import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true },
    marina: { type: mongoose.Schema.Types.ObjectId, ref: 'Marina', required: true },
    type: {
      type: String,
      enum: ['maintenance', 'blocked', 'locked_deal', 'holiday'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

availabilitySchema.index({ boat: 1, startDate: 1, endDate: 1 });

export default mongoose.model('Availability', availabilitySchema);
