import { User } from './auth';

export interface Team {
  id: string;
  name: string;
  scoutId: string;
  memberIds: string[];
  members?: User[];
  scout?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamRequest {
  name: string;
}

export interface AddMemberRequest {
  memberIds: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
}
