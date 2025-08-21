// src/models/Facility.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { FacilityType } from '../types/facility';

type FacilityDocument = FacilityType & Document;
type FacilityModel = Model<FacilityDocument>;

const FacilitySchema = new Schema<FacilityDocument>({
  name: { type: String, required: true },
  icon: String,
});

export default (mongoose.models.Facility as FacilityModel) ||
  mongoose.model<FacilityDocument>('Facility', FacilitySchema);
