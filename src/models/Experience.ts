// src/models/Experience.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  description: string;
  coverImage: string;
  gallery: string[];
  category: 'tour' | 'event';
  tags: string[];
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  duration: string;
  price: number;
  availableQuantity: number;
  currency: string;
  visibility: 'public' | 'private' | 'draft';
  isFeatured: boolean;
  owner: {
    userId: string;
    name: string;
    avatarUrl: string;
  };
  availableDates: string[] | Date[];
  createdAt: Date;
  updatedAt: Date;
}

type ExperienceDocument = IExperience;
type ExperienceModel = Model<ExperienceDocument>;

const ExperienceSchema = new Schema<ExperienceDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  gallery: [{ type: String }],
  category: { type: String, enum: ['tour', 'event'], required: true },
  tags: [{ type: String }],
  location: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  duration: { type: String },
  price: { type: Number, required: true, min: 0 },
  availableQuantity: { type: Number, required: true, min: 0, default: 1 },
  currency: { type: String, default: 'BRL' },
  visibility: { type: String, enum: ['public', 'private', 'draft'], default: 'public' },
  isFeatured: { type: Boolean, default: false },
  owner: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, required: false }
  },
  availableDates: [{ type: Date, required: true }]
}, {
  timestamps: true
});

ExperienceSchema.index({ visibility: 1 });
ExperienceSchema.index({ 'owner.userId': 1 });

export default (mongoose.models.Experience as ExperienceModel) ||
  mongoose.model<ExperienceDocument>("Experience", ExperienceSchema);