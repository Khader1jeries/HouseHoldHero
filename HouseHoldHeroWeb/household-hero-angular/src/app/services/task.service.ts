// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { UserService } from './user.service';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id?: string;
  author: string;
  authorImage: string;
  content: string;
  timestamp: Date;
}

export interface Vote {
  memberId: string;
  memberName: string;
  memberImage: string;
  vote: 'yes' | 'no';
  timestamp: Date;
  comment?: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo: string;
  assigneeImage?: string;
  assigneeName?: string;
  dueDate: Date;
  startDate?: Date;
  status: 'pending' | 'completed' | 'upcoming' | 'voting';
  points: number;
  remainingTime?: string;
  completionDate?: Date;
  completedOnTime?: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  subTasks?: SubTask[];
  comments?: Comment[];
  votes?: Vote[];
  votesYes?: number;
  votesNo?: number;
  createdBy: string;
  createdDate: Date;
  familyId?: string;
  [key: string]: any; // Add index signature to allow dynamically accessing properties
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient, private userService: UserService) {}

  // Get all tasks with optional filters
  getTasks(status?: string, familyId?: string): Observable<Task[]> {
    let url = this.apiUrl;
    const params: any = {};

    if (status) {
      params.status = status;
    }

    // If family ID is not provided, try to get it from the current user
    if (!familyId) {
      const user = this.userService.getCurrentUser();
      if (user && user.familyId) {
        params.familyId = user.familyId;
      }
    } else {
      params.familyId = familyId;
    }

    // Build query string manually if we have params
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&');
      url = `${url}?${queryString}`;
    }

    return this.http.get<Task[]>(url).pipe(
      map((tasks) => this.processTasks(tasks)),
      catchError((error) => {
        console.error('Error fetching tasks:', error);
        return of([]);
      })
    );
  }

  // Helper method to process tasks and ensure dates are Date objects
  private processTasks(tasks: Task[]): Task[] {
    return tasks.map((task) => this.processTask(task));
  }

  // Get tasks filtered by status
  getTasksByStatus(
    status: 'pending' | 'completed' | 'upcoming' | 'voting'
  ): Observable<Task[]> {
    const user = this.userService.getCurrentUser();
    let url = `${this.apiUrl}/status/${status}`;

    if (user && user.familyId) {
      url = `${url}?familyId=${user.familyId}`;
    }

    return this.http.get<Task[]>(url).pipe(
      catchError((error) => {
        console.error(`Error fetching ${status} tasks:`, error);
        return of([]);
      })
    );
  }

  // Get task by ID
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      map((task) => this.processTask(task)),
      catchError((error) => {
        console.error(`Error fetching task ${id}:`, error);
        throw error;
      })
    );
  }

  // Helper method to process a single task
  private processTask(task: Task): Task {
    const processedTask = { ...task } as Task;

    // Process date fields
    if (processedTask.dueDate && !(processedTask.dueDate instanceof Date)) {
      try {
        processedTask.dueDate = new Date(processedTask.dueDate);
      } catch (e) {
        console.error(`Error converting dueDate to Date:`, e);
        processedTask.dueDate = new Date();
      }
    }

    if (processedTask.startDate && !(processedTask.startDate instanceof Date)) {
      try {
        processedTask.startDate = new Date(processedTask.startDate);
      } catch (e) {
        console.error(`Error converting startDate to Date:`, e);
        processedTask.startDate = new Date();
      }
    }

    if (
      processedTask.completionDate &&
      !(processedTask.completionDate instanceof Date)
    ) {
      try {
        processedTask.completionDate = new Date(processedTask.completionDate);
      } catch (e) {
        console.error(`Error converting completionDate to Date:`, e);
        processedTask.completionDate = new Date();
      }
    }

    if (
      processedTask.createdDate &&
      !(processedTask.createdDate instanceof Date)
    ) {
      try {
        processedTask.createdDate = new Date(processedTask.createdDate);
      } catch (e) {
        console.error(`Error converting createdDate to Date:`, e);
        processedTask.createdDate = new Date();
      }
    }

    // Process date fields in comments
    if (processedTask.comments && Array.isArray(processedTask.comments)) {
      processedTask.comments = processedTask.comments.map((comment) => {
        if (comment.timestamp && !(comment.timestamp instanceof Date)) {
          try {
            return { ...comment, timestamp: new Date(comment.timestamp) };
          } catch (e) {
            console.error('Error converting comment timestamp to Date:', e);
            return { ...comment, timestamp: new Date() };
          }
        }
        return comment;
      });
    }

    // Process date fields in votes
    if (processedTask.votes && Array.isArray(processedTask.votes)) {
      processedTask.votes = processedTask.votes.map((vote) => {
        if (vote.timestamp && !(vote.timestamp instanceof Date)) {
          try {
            return { ...vote, timestamp: new Date(vote.timestamp) };
          } catch (e) {
            console.error('Error converting vote timestamp to Date:', e);
            return { ...vote, timestamp: new Date() };
          }
        }
        return vote;
      });
    }

    return processedTask;
  }

  // Create new task
  createTask(task: Task): Observable<Task> {
    // Ensure the task has the family ID
    const user = this.userService.getCurrentUser();
    if (user && user.familyId) {
      task.familyId = user.familyId;
      task.createdBy = user.fullName || user.firstName + ' ' + user.lastName;
    }

    return this.http.post<Task>(this.apiUrl, task).pipe(
      catchError((error) => {
        console.error('Error creating task:', error);
        throw error;
      })
    );
  }

  // Update task
  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
      catchError((error) => {
        console.error(`Error updating task ${id}:`, error);
        throw error;
      })
    );
  }

  // Delete task
  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error deleting task ${id}:`, error);
        throw error;
      })
    );
  }

  // Add comment to a task
  addComment(taskId: string, comment: Comment): Observable<Comment> {
    return this.http
      .post<Comment>(`${this.apiUrl}/${taskId}/comments`, comment)
      .pipe(
        catchError((error) => {
          console.error(`Error adding comment to task ${taskId}:`, error);
          throw error;
        })
      );
  }

  // Mark task as complete
  markTaskAsComplete(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/complete`, {}).pipe(
      catchError((error) => {
        console.error(`Error completing task ${id}:`, error);
        throw error;
      })
    );
  }

  // Add a vote to a task
  addVote(taskId: string, vote: Vote): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${taskId}/vote`, vote).pipe(
      catchError((error) => {
        console.error(`Error adding vote to task ${taskId}:`, error);
        throw error;
      })
    );
  }

  // Assign task from voting results
  assignTaskFromVoting(taskId: string, assignedTo: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${taskId}/assign-from-voting`, { assignedTo })
      .pipe(
        catchError((error) => {
          console.error(`Error assigning task ${taskId} from voting:`, error);
          throw error;
        })
      );
  }

  // Reopen voting for a task
  reopenVoting(taskId: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${taskId}/reopen-voting`, {})
      .pipe(
        catchError((error) => {
          console.error(`Error reopening voting for task ${taskId}:`, error);
          throw error;
        })
      );
  }

  // Calculate remaining time for a task (client-side function)
  calculateRemainingTime(dueDate: Date): string {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Overdue';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let result = '';
    if (days > 0) {
      result += `${days}d `;
    }
    if (hours > 0 || days > 0) {
      result += `${hours}h `;
    }
    result += `${minutes}m`;

    return result;
  }
}
