// src/models/Experience.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  description: string;
  coverImage: string;
  category: string;
  price: number;
  visibility: 'public' | 'private' | 'draft';
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
  category: { type: String, required: true },
  price: { type: Number, required: true },
  visibility: { type: String, enum: ['public', 'private', 'draft'], default: 'public' },
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