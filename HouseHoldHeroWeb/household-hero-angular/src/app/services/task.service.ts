import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { UserService } from './user.service';
import { Task } from './interfaces/task.interface';

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

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient, private userService: UserService) {}

  private convertFirestoreDate(firestoreDate: any): Date {
    return new Date();
  }

  getTasks(status?: string, familyId?: string): Observable<Task[]> {
    return of([]);
  }

  getTasksByStatus(
    status: 'pending' | 'completed' | 'upcoming' | 'voting'
  ): Observable<Task[]> {
    return of([]);
  }

  getTaskById(id: string): Observable<Task> {
    return of({} as Task);
  }

  private processTasks(tasks: Task[]): Task[] {
    return [];
  }

  private processTask(task: Task): Task {
    return {} as Task;
  }

  createTask(task: Task): Observable<Task> {
    return of({} as Task);
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return of({} as Task);
  }

  deleteTask(id: string): Observable<any> {
    return of({});
  }

  addComment(taskId: string, comment: Comment): Observable<Comment> {
    return of({} as Comment);
  }

  markTaskAsComplete(id: string): Observable<Task> {
    return of({} as Task);
  }

  addVote(taskId: string, vote: Vote): Observable<any> {
    return of({});
  }

  assignTaskFromVoting(taskId: string, assignedTo: string): Observable<any> {
    return of({});
  }

  reopenVoting(taskId: string): Observable<any> {
    return of({});
  }

  getTasksForMember(memberId: string): Observable<Task[]> {
    return of([]);
  }

  calculateRemainingTime(dueDate: any): string {
    return '';
  }

  calculateTimeUntilStart(startDate: any): string {
    return '';
  }

  isCompletedOnTime(task: Task): boolean {
    return true;
  }

  getTaskStatus(task: Task): string {
    return '';
  }
}
