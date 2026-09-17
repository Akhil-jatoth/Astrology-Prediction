import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const HoroscopeCacheSchema = new Schema(
  {
    sign: { type: String, required: true, index: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    category: { type: String, default: 'general' },
    date: { type: String, required: true, index: true },
    content: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

HoroscopeCacheSchema.index({ sign: 1, period: 1, category: 1, date: 1 }, { unique: true });

export type IHoroscopeCache = InferSchemaType<typeof HoroscopeCacheSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const HoroscopeCache =
  mongoose.models.HoroscopeCache ?? mongoose.model('HoroscopeCache', HoroscopeCacheSchema);
