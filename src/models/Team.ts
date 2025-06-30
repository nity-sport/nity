import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  scoutId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamModel extends Model<ITeam> {}

const TeamSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    scoutId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

TeamSchema.index({ scoutId: 1 });
TeamSchema.index({ memberIds: 1 });
TeamSchema.index({ name: 1, scoutId: 1 });

const Team: ITeamModel = (mongoose.models.Team as ITeamModel) || mongoose.model<ITeam, ITeamModel>('Team', TeamSchema);
export default Team;