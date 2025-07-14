// src/models/Sport.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISport extends Document {
  name: string;
  icon?: string;
  isActive: boolean;
  status: 'aceito' | 'sugerido';
  createdAt: Date;
  updatedAt: Date;
}

type SportModel = Model<ISport>;

const SportSchema = new Schema<ISport>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  icon: { 
    type: String, 
    required: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  status: {
    type: String,
    enum: ['aceito', 'sugerido'],
    default: 'aceito'
  }
}, {
  timestamps: true
});

export default (mongoose.models.Sport as SportModel) ||
  mongoose.model<ISport>("Sport", SportSchema);