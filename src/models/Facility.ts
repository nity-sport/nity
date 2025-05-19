// src/models/Facility.ts
import mongoose, { Schema, Document } from "mongoose";
import { FacilityType } from "../types/facility";

const FacilitySchema = new Schema<FacilityType & Document>({
  name: { type: String, required: true },
  icon: String,
});

export default mongoose.models.Facility ||
  mongoose.model<FacilityType & Document>("Facility", FacilitySchema);
