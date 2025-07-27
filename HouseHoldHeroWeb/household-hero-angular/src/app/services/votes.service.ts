// src/app/services/votes.service.ts
import { environment } from '../../enviroments/enviroment';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MoveTaskData, VoteTask } from './interfaces/votes.interface'; // ✅ import here

@Injectable({
  providedIn: 'root',
})
export class VotesService {
  private apiUrl = `${environment.apiUrl}/tasksUnderVote`;
  constructor(private http: HttpClient) {}

  createVote(task: VoteTask): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, task);
  }

  getVoteByAdmin(adminEmail: string): Observable<VoteTask[]> {
    return this.http.get<VoteTask[]>(`${this.apiUrl}/${adminEmail}`);
  }
  getVoteById(taskId: string): Observable<VoteTask> {
    return this.http.get<VoteTask>(`${this.apiUrl}/id/${taskId}`);
  }
  getTwoVotes(adminEmail: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getTwo/${adminEmail}`);
  }

  getActiveTasks(adminEmail: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active/${adminEmail}`);
  }

  getExpiredTasks(adminEmail: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expired/${adminEmail}`);
  }
  moveTaskToActive(taskId: string, moveData: MoveTaskData): Observable<any> {
    return this.http.post(`${this.apiUrl}/move/${taskId}`, moveData);
  }
}
