// InternLink Type Definitions

export type UserRole = 'STUDENT' | 'COMPANY' | 'SUPERVISOR' | 'ADMIN';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type OfferStatus = 'ACTIVE' | 'CLOSED' | 'PAUSED';
export type OfferType = 'INTERNSHIP' | 'APPRENTICESHIP';
export type RemoteType = 'ON_SITE' | 'REMOTE' | 'HYBRID';
export type ReportStatus = 'SUBMITTED' | 'VALIDATED' | 'REVISION_NEEDED';
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  active: boolean;
  createdAt: string;
  studentProfile?: StudentProfile;
  companyProfile?: CompanyProfile;
  supervisorProfile?: SupervisorProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  university?: string;
  fieldOfStudy?: string;
  year?: string;
  cvUrl?: string;
  skills?: string;
  portfolioUrl?: string;
  bio?: string;
  location?: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  registrationNum?: string;
  industry?: string;
  description?: string;
  website?: string;
  location?: string;
  city?: string;
  logoUrl?: string;
  verified: boolean;
}

export interface SupervisorProfile {
  id: string;
  userId: string;
  companyId: string;
  department?: string;
  title?: string;
  company?: CompanyProfile;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
  _count?: { offers: number };
}

export interface Offer {
  id: string;
  companyId: string;
  categoryId?: string;
  title: string;
  description: string;
  requirements?: string;
  skills?: string;
  type: OfferType;
  duration?: string;
  startDate?: string;
  stipend?: string;
  location?: string;
  city?: string;
  remoteType: RemoteType;
  slots: number;
  deadline?: string;
  status: OfferStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
  company?: CompanyProfile;
  category?: Category;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  studentId: string;
  offerId: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  student?: StudentProfile & { user?: User };
  offer?: Offer;
  reports?: Report[];
  certificate?: Certificate;
}

export interface Report {
  id: string;
  applicationId: string;
  supervisorId?: string;
  weekNumber: number;
  activities: string;
  challenges?: string;
  nextPlan?: string;
  fileUrl?: string;
  fileName?: string;
  status: ReportStatus;
  supervisorComment?: string;
  validatedAt?: string;
  submittedAt: string;
  application?: Application;
  supervisor?: SupervisorProfile & { user?: User };
}

export interface Certificate {
  id: string;
  applicationId: string;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl?: string;
}

export interface Review {
  id: string;
  studentId: string;
  companyId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  student?: StudentProfile & { user?: User };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ReportGuide {
  id: string;
  title: string;
  content: string;
  templateFileUrl?: string;
  order: number;
  active: boolean;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
  ip?: string;
  createdAt: string;
  user?: User;
}

export interface PlatformStats {
  totalStudents: number;
  totalCompanies: number;
  totalOffers: number;
  totalApplications: number;
  activeOffers: number;
  pendingCompanies: number;
  applicationsByStatus: Record<string, number>;
  recentSignups: number;
}

// Navigation types
export type PageView = 
  | 'landing'
  | 'login'
  | 'register'
  | 'student-dashboard'
  | 'student-offers'
  | 'student-applications'
  | 'student-reports'
  | 'student-guide'
  | 'student-profile'
  | 'company-dashboard'
  | 'company-offers'
  | 'company-applications'
  | 'company-interns'
  | 'company-reports'
  | 'company-profile'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-companies'
  | 'admin-categories'
  | 'admin-audit'
  | 'admin-guide'
  | 'offer-detail'
  | 'supervisor-dashboard'
  | 'supervisor-reports';

export interface NavigationState {
  currentPage: PageView;
  selectedOfferId?: string;
  selectedApplicationId?: string;
}
