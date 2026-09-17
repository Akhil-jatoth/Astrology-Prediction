import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const BirthPlaceSchema = new Schema(
  {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    tzOffset: { type: Number, required: true },
  },
  { _id: false }
);

const BirthProfileSchema = new Schema(
  {
    dob: { type: String, required: true },
    birthTime: { type: String, required: true },
    birthPlace: { type: BirthPlaceSchema, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String },
    avatarUrl: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not'] },
    country: { type: String },
    language: { type: String, default: 'en' },
    authProvider: { type: String, default: 'email' },
    birthProfile: { type: BirthProfileSchema },
    premiumTier: { type: String, enum: ['free', 'plus', 'pro'], default: 'free' },
    preferences: {
      notifications: {
        dailyHoroscope: { type: Boolean, default: true },
        moonAlerts: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User =
  mongoose.models.User ?? mongoose.model('User', UserSchema);
