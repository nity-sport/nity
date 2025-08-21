import mongoose, { Schema, Document, Model } from 'mongoose';
import { CoachType } from '../types/coach';

type CoachDocument = CoachType & Document;
type CoachModel = Model<CoachDocument>;

const CoachSchema = new Schema<CoachDocument>({
  name: { type: String, required: true },
  age: Number,
  miniBio: String,
  achievements: [String],
  profileImage: String,
});

export default (mongoose.models.Coach as CoachModel) ||
  mongoose.model<CoachDocument>('Coach', CoachSchema);
