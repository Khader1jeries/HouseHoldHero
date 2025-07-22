export interface VoteTask {
  id?: string;
  title: string;
  description: string;
  createdAt: any;
  startDate: any;
  dueDate: any;
  priority: string;
  adminEmail: string;
  yes?: Array<any>;
  no?: Array<any>;
  subtasks?: {
    [key: string]: {
      score: number;
      status: boolean;
    };
  };
  comment?: string;
}
