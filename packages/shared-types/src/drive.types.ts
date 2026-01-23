export type DriveStatus =
  | "DRAFT"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type RegistrationStatus =
  | "REGISTERED"
  | "SHORTLISTED"
  | "REJECTED"
  | "SELECTED"
  | "NOT_SELECTED";

export interface Drive {
  id: string;
  title: string;
  description?: string;
  companyName: string;
  companyLogo?: string;
  registrationStart: Date;
  registrationEnd: Date;
  driveStart: Date;
  driveEnd: Date;
  eligibleDepartments: string[];
  minCGPA?: number;
  graduationYears: number[];
  status: DriveStatus;
  collegeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriveWithTests extends Drive {
  tests: DriveTestInfo[];
}

export interface DriveTestInfo {
  id: string;
  order: number;
  isMandatory: boolean;
  test: {
    id: string;
    title: string;
    duration: number;
    totalMarks: number;
  };
}

export interface CreateDriveInput {
  title: string;
  description?: string;
  companyName: string;
  companyLogo?: string;
  registrationStart: Date;
  registrationEnd: Date;
  driveStart: Date;
  driveEnd: Date;
  eligibleDepartments?: string[];
  minCGPA?: number;
  graduationYears?: number[];
}

export interface UpdateDriveInput extends Partial<CreateDriveInput> {
  status?: DriveStatus;
}

export interface DriveRegistration {
  id: string;
  driveId: string;
  userId: string;
  cgpa?: number;
  resumeUrl?: string;
  status: RegistrationStatus;
  createdAt: Date;
}

export interface RegisterForDriveInput {
  cgpa?: number;
  resumeUrl?: string;
}

export interface DriveCandidate {
  id: string;
  driveId: string;
  status: RegistrationStatus;
  cgpa?: number;
  resumeUrl?: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    rollNumber?: string;
    department?: string;
    graduationYear?: number;
  };
  testResults?: {
    testId: string;
    testTitle: string;
    score?: number;
    percentage?: number;
    passed?: boolean;
    status: string;
  }[];
}
