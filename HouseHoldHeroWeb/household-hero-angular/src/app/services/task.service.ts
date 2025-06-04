// src/app/services/task.service.ts - Complete updated version with Firestore date handling
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

  // Helper method to convert Firestore timestamps to JavaScript Dates
  private convertFirestoreDate(firestoreDate: any): Date {
    if (!firestoreDate) return new Date();

    try {
      // Handle Firestore Timestamp with toDate() method
      if (firestoreDate.toDate && typeof firestoreDate.toDate === 'function') {
        return firestoreDate.toDate();
      }

      // Handle Firestore Timestamp with seconds property
      if (firestoreDate.seconds !== undefined) {
        const nanoseconds = firestoreDate.nanoseconds || 0;
        return new Date(firestoreDate.seconds * 1000 + nanoseconds / 1000000);
      }

      // Handle _seconds property (another Firestore format)
      if (firestoreDate._seconds !== undefined) {
        const nanoseconds = firestoreDate._nanoseconds || 0;
        return new Date(firestoreDate._seconds * 1000 + nanoseconds / 1000000);
      }

      // If it's already a Date object
      if (firestoreDate instanceof Date) {
        return firestoreDate;
      }

      // Fallback to regular Date constructor for strings/numbers
      return new Date(firestoreDate);
    } catch (error) {
      console.error('Error converting Firestore date:', error, firestoreDate);
      return new Date(); // Fallback to current date
    }
  }

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

  // Helper method to process a single task with proper Firestore date handling
  private processTask(task: Task): Task {
    const processedTask = { ...task } as Task;

    console.log('Processing task:', processedTask.id, processedTask); // Debug log

    // Process date fields with Firestore handling
    ['dueDate', 'startDate', 'completionDate', 'createdDate'].forEach(
      (field) => {
        if (processedTask[field]) {
          try {
            processedTask[field] = this.convertFirestoreDate(
              processedTask[field]
            );
            console.log(`Converted ${field}:`, processedTask[field]);
          } catch (e) {
            console.error(
              `Error converting ${field} to Date:`,
              e,
              processedTask[field]
            );
            processedTask[field] = new Date(); // Fallback to current date
          }
        }
      }
    );

    // Process comments timestamps
    if (processedTask.comments && Array.isArray(processedTask.comments)) {
      processedTask.comments = processedTask.comments.map((comment) => {
        if (comment.timestamp && !(comment.timestamp instanceof Date)) {
          try {
            return {
              ...comment,
              timestamp: this.convertFirestoreDate(comment.timestamp),
            };
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
            return {
              ...vote,
              timestamp: this.convertFirestoreDate(vote.timestamp),
            };
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

    console.log('Processed task result:', processedTask); // Debug log

    return processedTask;
  }

  // Create new task
  createTask(task: Task): Observable<Task> {
    const user = this.userService.getCurrentUser();

    if (!user) {
      return throwError('User must be logged in to create tasks');
    }

    if (!user.email) {
      return throwError('User must belong to a family to create tasks');
    }

    // Set family ID and creator
    task.familyId = user.email;
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

  // Add comment to task
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
      map((completedTask) => this.processTask(completedTask)),
      catchError((error) => {
        console.error(`Error completing task ${id}:`, error);
        throw error;
      })
    );
  }

  // Add vote to task
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

  // Get tasks for a specific member
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

  // Calculate remaining time with proper Firestore date handling
  calculateRemainingTime(dueDate: any): string {
    try {
      const now = new Date();
      let due: Date;

      console.log('Processing due date for remaining time:', dueDate); // Debug log

      // Convert Firestore date to proper Date object
      due = this.convertFirestoreDate(dueDate);

      // Validate the converted date
      if (!due || isNaN(due.getTime())) {
        console.error('Invalid date after conversion:', due, 'from:', dueDate);
        return 'Invalid Date';
      }

      console.log('Final due date for calculation:', due); // Debug log

      const diff = due.getTime() - now.getTime();

      if (diff <= 0) {
        return 'Overdue';
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Ensure we don't get NaN values
      const validDays = isNaN(days) ? 0 : days;
      const validHours = isNaN(hours) ? 0 : hours;
      const validMinutes = isNaN(minutes) ? 0 : minutes;

      let result = '';
      if (validDays > 0) result += `${validDays}d `;
      if (validHours > 0 || validDays > 0) result += `${validHours}h `;
      result += `${validMinutes}m`;

      return result.trim();
    } catch (error) {
      console.error(
        'Error calculating remaining time:',
        error,
        'for date:',
        dueDate
      );
      return 'Calculation Error';
    }
  }

  // Calculate time until task starts (for future tasks)
  calculateTimeUntilStart(startDate: any): string {
    try {
      const now = new Date();
      const start = this.convertFirestoreDate(startDate);

      if (!start || isNaN(start.getTime())) {
        return 'Invalid Start Date';
      }

      const diff = start.getTime() - now.getTime();

      if (diff <= 0) {
        return 'Starting now';
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      let result = '';
      if (days > 0) result += `${days}d `;
      if (hours > 0) result += `${hours}h `;
      result += `${minutes}m`;

      return result.trim();
    } catch (error) {
      console.error('Error calculating time until start:', error);
      return 'Calculation Error';
    }
  }

  // Check if task was completed on time
  isCompletedOnTime(task: Task): boolean {
    if (!task.completionDate || !task.dueDate) {
      return true; // Default to true if dates are missing
    }

    const completion = this.convertFirestoreDate(task.completionDate);
    const due = this.convertFirestoreDate(task.dueDate);

    return completion.getTime() <= due.getTime();
  }

  // Get task status based on dates and current time
  getTaskStatus(task: Task): string {
    const now = new Date();

    if (task.status === 'completed') {
      return 'completed';
    }

    if (task.status === 'voting') {
      return 'voting';
    }

    if (task.startDate) {
      const start = this.convertFirestoreDate(task.startDate);
      if (start.getTime() > now.getTime()) {
        return 'upcoming';
      }
    }

    if (task.dueDate) {
      const due = this.convertFirestoreDate(task.dueDate);
      if (due.getTime() < now.getTime()) {
        return 'overdue';
      }
    }

    return 'pending';
  }
}
