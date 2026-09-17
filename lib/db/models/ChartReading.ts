import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const ChartInputSchema = new Schema(
  {
    dob: String,
    birthTime: String,
    lat: Number,
    lng: Number,
    tzOffset: Number,
  },
  { _id: false }
);

const PlanetPositionSchema = new Schema(
  {
    planet: String,
    longitude: Number,
    sign: String,
    degreeFormatted: String,
    retrograde: Boolean,
  },
  { _id: false }
);

const HouseSchema = new Schema(
  {
    house: Number,
    cusp: Number,
    sign: String,
  },
  { _id: false }
);

const CalculatedSchema = new Schema(
  {
    sunSign: String,
    moonSign: String,
    ascendant: String,
    ascendantDegree: String,
    nakshatra: String,
    houses: [HouseSchema],
    planetPositions: [PlanetPositionSchema],
    calculatedAt: String,
  },
  { _id: false }
);

const ChartReadingSchema = new Schema(
  {
    userId: { type: String, index: true },
    input: { type: ChartInputSchema, required: true },
    calculated: { type: CalculatedSchema, required: true },
  },
  { timestamps: { createdAt: 'generatedAt', updatedAt: false } }
);

export type IChartReading = InferSchemaType<typeof ChartReadingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ChartReading =
  mongoose.models.ChartReading ?? mongoose.model('ChartReading', ChartReadingSchema);
