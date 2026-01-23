export interface College {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  website?: string;
  contactEmail?: string;
  isActive: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface CollegeMember {
  id: string;
  collegeId: string;
  userId: string;
  role: CollegeRole;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export type CollegeRole = "owner" | "admin" | "member" | "recruiter";

export interface CreateCollegeInput {
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  website?: string;
  contactEmail?: string;
}

export interface UpdateCollegeInput extends Partial<CreateCollegeInput> {
  isActive?: boolean;
}

export interface InviteMemberInput {
  email: string;
  role: CollegeRole;
}

export interface CollegeInvitation {
  id: string;
  collegeId: string;
  email: string;
  role: CollegeRole;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: Date;
  inviterId: string;
  createdAt: Date;
}
