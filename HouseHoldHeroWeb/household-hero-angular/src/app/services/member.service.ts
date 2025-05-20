// src/app/services/member.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { isPlatformBrowser } from '@angular/common';

export interface Member {
  id?: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  countryCode?: string;
  age?: number;
  role: string;
  profileImage: string;
  activeTasks?: number;
  score: number;
  completionRate?: number;
  joinDate?: Date;
  lastActive?: Date;
  familyId?: string;
  tasks?: any[]; // Make this optional
}

export interface PerformanceData {
  week: number;
  tasks: number;
  completed: number;
  points: number;
}

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private apiUrl = `${environment.apiUrl}/members`;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Get all members for a family
  getMembers(familyId?: string): Observable<Member[]> {
    // If familyId is not provided, try to get it from localStorage
    if (!familyId && this.isBrowser) {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        familyId = userData.familyId;
      }
    }

    if (!familyId) {
      console.error('No family ID provided or found in localStorage');
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.http.get<Member[]>(`${this.apiUrl}?familyId=${familyId}`);
  }

  // Get member by ID
  getMemberById(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  // Create new member
  createMember(member: Member): Observable<Member> {
    // Get familyId from localStorage if not provided
    if (!member.familyId) {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        member.familyId = userData.familyId;
      }
    }

    return this.http.post<Member>(this.apiUrl, member);
  }

  // Update member
  updateMember(id: string, member: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, member);
  }

  // Delete member
  deleteMember(id: string, familyId?: string): Observable<any> {
    // If familyId is not provided, try to get it from localStorage
    if (!familyId) {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        familyId = userData.familyId;
      }
    }

    if (!familyId) {
      console.error('No family ID provided or found in localStorage');
      return new Observable((observer) => {
        observer.error('No family ID provided');
      });
    }

    return this.http.delete(`${this.apiUrl}/${id}?familyId=${familyId}`);
  }

  // Get member's tasks
  getMemberTasks(id: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/${id}`)
      .pipe(map((memberData: any) => memberData.tasks || []));
  }

  // Get member's performance data
  getMemberPerformance(id: string): Observable<PerformanceData[]> {
    return this.http.get<PerformanceData[]>(`${this.apiUrl}/${id}/performance`);
  }

  // Get leaderboard
  getLeaderboard(
    familyId: string,
    period: 'week' | 'month' | 'year' = 'month'
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/leaderboard/${familyId}?period=${period}`
    );
  }

  // Update member score
  updateMemberScore(
    id: string,
    points: number,
    operation: 'add' | 'subtract' | 'set' = 'add'
  ): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/score`, {
      points,
      operation,
    });
  }
}
