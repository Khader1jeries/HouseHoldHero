// src/app/services/task.service.ts - Updated to use memory-based user data
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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
  assignedToName?: string;
  assignedToFullName?: string;
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
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient, private userService: UserService) {}

  // Get all tasks with family filtering
  getTasks(status?: string, familyId?: string): Observable<Task[]> {
    let url = this.apiUrl;
    const params: any = {};

    if (status) {
      params.status = status;
    }

    // Get familyId from user service or parameter
    const targetFamilyId = familyId || this.userService.getFamilyId();

    if (!targetFamilyId) {
      console.error(
        'No family ID available - user may not be logged in or not belong to a family'
      );
      return throwError(
        'No family ID available. Please ensure you are logged in and belong to a family.'
      );
    }

    params.familyId = targetFamilyId;

    // Build query string
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    url = `${url}?${queryString}`;

    return this.http.get<Task[]>(url).pipe(
      map((tasks) => this.processTasks(tasks)),
      catchError((error) => {
        console.error('Error fetching tasks:', error);
        if (error.status === 400 && error.error?.error?.includes('familyId')) {
          return throwError(
            'Family ID is required but not available. Please log in again.'
          );
        }
        return of([]);
      })
    );
  }

  // Get tasks filtered by status
  getTasksByStatus(
    status: 'pending' | 'completed' | 'upcoming' | 'voting'
  ): Observable<Task[]> {
    const familyId = this.userService.getFamilyId();

    if (!familyId) {
      console.error('No family ID available for tasks by status');
      return throwError(
        'No family ID available. Please ensure you are logged in and belong to a family.'
      );
    }

    const url = `${this.apiUrl}/status/${status}?familyId=${familyId}`;

    return this.http.get<Task[]>(url).pipe(
      map((tasks) => this.processTasks(tasks)),
      catchError((error) => {
        console.error(`Error fetching ${status} tasks:`, error);
        return of([]);
      })
    );
  }

  // Get task by ID with family verification
  getTaskById(id: string): Observable<Task> {
    const familyId = this.userService.getFamilyId();
    let url = `${this.apiUrl}/${id}`;

    if (familyId) {
      url = `${url}?familyId=${familyId}`;
    } else {
      return throwError(
        'No family ID available. Cannot retrieve task details.'
      );
    }

    return this.http.get<Task>(url).pipe(
      map((task) => this.processTask(task)),
      catchError((error) => {
        console.error(`Error fetching task ${id}:`, error);
        throw error;
      })
    );
  }

  // Helper method to process tasks
  private processTasks(tasks: Task[]): Task[] {
    return tasks.map((task) => this.processTask(task));
  }

  // Helper method to process a single task
  private processTask(task: Task): Task {
    const processedTask = { ...task } as Task;

    // Process date fields
    ['dueDate', 'startDate', 'completionDate', 'createdDate'].forEach(
      (field) => {
        if (processedTask[field] && !(processedTask[field] instanceof Date)) {
          try {
            processedTask[field] = new Date(processedTask[field]);
          } catch (e) {
            console.error(`Error converting ${field} to Date:`, e);
            processedTask[field] = new Date();
          }
        }
      }
    );

    // Process comments timestamps
    if (processedTask.comments && Array.isArray(processedTask.comments)) {
      processedTask.comments = processedTask.comments.map((comment) => {
        if (comment.timestamp && !(comment.timestamp instanceof Date)) {
          try {
            return { ...comment, timestamp: new Date(comment.timestamp) };
          } catch (e) {
            console.error('Error converting comment timestamp:', e);
            return { ...comment, timestamp: new Date() };
          }
        }
        return comment;
      });
    }

    // Process votes timestamps
    if (processedTask.votes && Array.isArray(processedTask.votes)) {
      processedTask.votes = processedTask.votes.map((vote) => {
        if (vote.timestamp && !(vote.timestamp instanceof Date)) {
          try {
            return { ...vote, timestamp: new Date(vote.timestamp) };
          } catch (e) {
            console.error('Error converting vote timestamp:', e);
            return { ...vote, timestamp: new Date() };
          }
        }
        return vote;
      });
    }

    // Set assignee name from server response
    if (processedTask.assignedToName) {
      processedTask.assigneeName = processedTask.assignedToName;
    }

    return processedTask;
  }

  // Create new task
  createTask(task: Task): Observable<Task> {
    const user = this.userService.getCurrentUser();

    if (!user) {
      return throwError('User must be logged in to create tasks');
    }

    if (!user.familyId) {
      return throwError('User must belong to a family to create tasks');
    }

    // Set family ID and creator
    task.familyId = user.familyId;
    task.createdBy =
      user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();

    return this.http.post<Task>(this.apiUrl, task).pipe(
      map((createdTask) => this.processTask(createdTask)),
      catchError((error) => {
        console.error('Error creating task:', error);
        throw error;
      })
    );
  }

  // Update task
  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    const familyId = this.userService.getFamilyId();
    let url = `${this.apiUrl}/${id}`;

    if (familyId) {
      url = `${url}?familyId=${familyId}`;
    } else {
      return throwError('No family ID available. Cannot update task.');
    }

    return this.http.put<Task>(url, task).pipe(
      map((updatedTask) => this.processTask(updatedTask)),
      catchError((error) => {
        console.error(`Error updating task ${id}:`, error);
        throw error;
      })
    );
  }

  // Delete task
  deleteTask(id: string): Observable<any> {
    const familyId = this.userService.getFamilyId();
    let url = `${this.apiUrl}/${id}`;

    if (familyId) {
      url = `${url}?familyId=${familyId}`;
    } else {
      return throwError('No family ID available. Cannot delete task.');
    }

    return this.http.delete(url).pipe(
      catchError((error) => {
        console.error(`Error deleting task ${id}:`, error);
        throw error;
      })
    );
  }

  // Rest of the methods remain the same...
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

  markTaskAsComplete(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/complete`, {}).pipe(
      map((completedTask) => this.processTask(completedTask)),
      catchError((error) => {
        console.error(`Error completing task ${id}:`, error);
        throw error;
      })
    );
  }

  addVote(taskId: string, vote: Vote): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${taskId}/vote`, vote).pipe(
      catchError((error) => {
        console.error(`Error adding vote to task ${taskId}:`, error);
        throw error;
      })
    );
  }

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

  getTasksForMember(memberId: string): Observable<Task[]> {
    const familyId = this.userService.getFamilyId();

    if (!familyId) {
      return throwError('No family ID available for member tasks');
    }

    const url = `${this.apiUrl}?assignedTo=${memberId}&familyId=${familyId}`;

    return this.http.get<Task[]>(url).pipe(
      map((tasks) => this.processTasks(tasks)),
      catchError((error) => {
        console.error(`Error fetching tasks for member ${memberId}:`, error);
        return of([]);
      })
    );
  }

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
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m`;

    return result;
  }
}
