// src/models/Accommodation.ts
import mongoose, { Schema, Document } from 'mongoose';
import { AccommodationType } from '../types/accomodation';

const AccommodationSchema = new Schema<AccommodationType & Document>({
  name: { type: String, required: true },
  category: String,
  coverImage: String,
  images: [String],
  facilities: [{ type: Schema.Types.Mixed }],
  location: {
    city: String,
    country: String,
    number: String,
    state: String,
    street: String,
    zip_code: String,
  },
});

export default mongoose.models.Accommodation ||
  mongoose.model<AccommodationType & Document>(
    'Accommodation',
    AccommodationSchema
  );
