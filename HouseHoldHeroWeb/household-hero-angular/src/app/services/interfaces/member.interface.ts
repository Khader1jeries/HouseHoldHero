export interface Member {
  email: string;
  adminEmail: string;
  countryCode: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  activeTasks?: number;
  completedTasks?: number;
  completionRate?: number;
  fullName?: string;
  score?: number;
  totalTasks?: number;
}
