// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

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

export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo: string;
  assigneeImage?: string;
  dueDate: Date;
  startDate?: Date;
  status: 'pending' | 'completed' | 'upcoming' | 'voting';
  points: number;
  remainingTime?: string;
  completionDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  subTasks?: SubTask[];
  comments?: Comment[];
  createdBy: string;
  createdDate: Date;
  votesYes?: number;
  votesNo?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // Get all tasks
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // Get tasks filtered by status
  getTasksByStatus(
    status: 'pending' | 'completed' | 'upcoming' | 'voting'
  ): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/status/${status}`);
  }

  // Get task by ID
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // Create new task
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  // Update task
  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  // Delete task
  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Add comment to a task
  addComment(taskId: string, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/${taskId}/comments`,
      comment
    );
  }

  // Mark task as complete
  markTaskAsComplete(id: string): Observable<Task> {
    const update = {
      status: 'completed',
      completionDate: new Date(),
    };
    return this.http.put<Task>(`${this.apiUrl}/${id}`, update);
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
