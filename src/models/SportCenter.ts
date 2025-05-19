// src/models/SportCenter.ts
import mongoose, { Schema, Document } from "mongoose";
import { SportCenterType } from "../types/sportcenter";


const SportCenterSchema = new Schema<SportCenterType & Document>({
  name: { type: String, required: true },
  mainPhoto: String,
  profilePhoto: String,
  photos: [String],
  category: [String],
  achievements: [String],
  badge: String,
  coaches: [{ type: Schema.Types.Mixed }], 
  dormitory: { type: Boolean, required: true },
  dormitoryCosts: Number,
  dormitoryMainPhoto: String,
  dormitoryPhotos: [String],
  experienceCost: Number,
  extraSport: String,
  facilities: [{ type: Schema.Types.Mixed }],
  hostBio: String,
  hosterImage: String,
  hosterName: String,
  location: {
    city: String,
    country: String,
    number: String,
    state: String,
    street: String,
    zip_code: String,
  },
  owner: { type: String, required: true },
  ownerMail: String,
  sport: [String],
  sportcenterBio: String,
  yearOfFoundation: String,
});

export default mongoose.models.SportCenter ||
  mongoose.model<SportCenterType & Document>("SportCenter", SportCenterSchema);
