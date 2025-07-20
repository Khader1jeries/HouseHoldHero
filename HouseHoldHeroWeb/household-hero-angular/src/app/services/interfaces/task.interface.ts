export interface SubTask {
  title: string;
  score: number;
  completed: boolean;
}
export interface Task {
  id?: string;
  createdAt: Date;
  description: string;
  dueDate: Date;
  startDate: Date;
  priority: 'low' | 'medium' | 'high';
  title: string;
  adminEmail: string;
  assignedTo: string;
  score: number;

  status: 'pending' | 'completed' | 'upcoming';
  remainingTime?: string;
  completionDate?: Date;
  completedOnTime?: boolean;
  subTasks?: SubTask[];
  [key: string]: any;
}
