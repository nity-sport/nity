// src/models/SportCenter.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { SportCenterType } from "../types/sportcenter";

type SportCenterDocument = SportCenterType & Document;
type SportCenterModel = Model<SportCenterDocument>;

const SportCenterSchema = new Schema<SportCenterDocument>({
  name: { type: String, required: true },
  mainPhoto: String,
  profilePhoto: String,
  photos: [String],
  categories: [{
    id: String,
    name: String,
    ageRange: [Number],
    gender: {
      type: String,
      enum: ['Masculino', 'Feminino', 'Misto']
    },
    schedule: {
      days: [String],
      times: [String]
    }
  }],
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

export default (mongoose.models.SportCenter as SportCenterModel) ||
  mongoose.model<SportCenterDocument>("SportCenter", SportCenterSchema);
