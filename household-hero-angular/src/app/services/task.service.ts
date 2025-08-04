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

  getTasks(adminEmail: string): Observable<Task[]> {
    if (!adminEmail) {
      throw new Error('adminEmail is required to fetch tasks');
    }

    const url = `${this.apiUrl}?adminEmail=${encodeURIComponent(adminEmail)}`;
    return this.http.get<Task[]>(url);
  }

  getTaskById(id: string): Observable<Task> {
    if (!id) {
      throw new Error('Task ID is required');
    }

    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Task>(url);
  }

  createTask(task: Task): Observable<any> {
    const taskData = {
      ...task,
    };

    return this.http.post<Task>(this.apiUrl, taskData);
  }
  getTwoActiveTasks(adminEmail: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/getTwo/${adminEmail}`);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
