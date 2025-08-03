export interface Member {
  email: string;
  adminEmail: string;
  countryCode: string;
  createdAt: Date | string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  DOB: string;
  activeTasks?: number;
  completedTasks?: number;
  fullName?: string;
  score?: number;
  totalTasks?: number;
  // Add the missing properties from your backend response
  completionRate?: number;
  password?: string; // Optional since we don't want to display this
  tasks?: Task[];
}

// Task interface for the tasks array
export interface Task {
  id: string;
  title: string;
  dueDate: Date | string;
  status: 'pending' | 'completed' | 'overdue';
  points: number;
}
