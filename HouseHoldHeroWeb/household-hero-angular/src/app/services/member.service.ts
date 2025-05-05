// src/app/services/member.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface Member {
  id?: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  role: string;
  profileImage: string;
  activeTasks?: number;
  score: number;
  completionRate?: number;
  joinDate?: Date;
  lastActive?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) {}

  // Get all members
  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl);
  }

  // Get member by ID
  getMemberById(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  // Create new member
  createMember(member: Member): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member);
  }

  // Update member
  updateMember(id: string, member: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, member);
  }

  // Delete member
  deleteMember(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get member's tasks
  getMemberTasks(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/tasks`);
  }

  // Get leaderboard
  getLeaderboard(
    period: 'week' | 'month' | 'year' = 'month'
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/leaderboard?period=${period}`
    );
  }
}
