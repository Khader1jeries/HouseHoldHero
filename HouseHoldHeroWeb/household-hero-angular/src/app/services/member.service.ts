// src/app/services/member.service.ts - Updated to use URL parameters for family ID
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './user.service';

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
  tasks?: any[];
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
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Get family ID from URL or user service
  private getFamilyIdFromContext(): string | null {
    return this.userService.getFamilyId();
  }

  // Get all members for a family
  getMembers(familyId?: string): Observable<Member[]> {
    // Use provided familyId or get from URL/user service
    const targetFamilyId = familyId || this.getFamilyIdFromContext();

    if (!targetFamilyId) {
      console.error('No family ID provided or found in URL/user context');
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.http.get<Member[]>(`${this.apiUrl}?familyId=${targetFamilyId}`);
  }

  // Get member by ID
  getMemberById(id: string): Observable<Member> {
    const familyId = this.getFamilyIdFromContext();
    let url = `${this.apiUrl}/${id}`;

    if (familyId) {
      url = `${url}?familyId=${familyId}`;
    }

    return this.http.get<Member>(url);
  }

  // Create new member
  createMember(member: Member): Observable<Member> {
    // Get familyId from URL/user context if not provided
    if (!member.familyId) {
      const familyId = this.getFamilyIdFromContext();
      if (familyId) {
        member.familyId = familyId;
      }
    }

    return this.http.post<Member>(this.apiUrl, member);
  }

  // Update member
  updateMember(id: string, member: Partial<Member>): Observable<Member> {
    const familyId = this.getFamilyIdFromContext();
    let url = `${this.apiUrl}/${id}`;

    if (familyId) {
      url = `${url}?familyId=${familyId}`;
    }

    return this.http.put<Member>(url, member);
  }

  // Delete member
  deleteMember(id: string, familyId?: string): Observable<any> {
    // Use provided familyId or get from URL/user context
    const targetFamilyId = familyId || this.getFamilyIdFromContext();

    if (!targetFamilyId) {
      console.error('No family ID provided or found in URL/user context');
      return new Observable((observer) => {
        observer.error('No family ID provided');
      });
    }

    return this.http.delete(`${this.apiUrl}/${id}?familyId=${targetFamilyId}`);
  }

  // Get member's tasks
  getMemberTasks(id: string): Observable<any[]> {
    const familyId = this.getFamilyIdFromContext();
    let url = `${this.apiUrl}/${id}/tasks`;

    if (familyId) {
      url = `${url}?familyId=${familyId}`;
    }

    return this.http.get<any[]>(url);
  }

  // Get member's performance data
  getMemberPerformance(id: string): Observable<PerformanceData[]> {
    return this.http.get<PerformanceData[]>(`${this.apiUrl}/${id}/performance`);
  }

  // Get leaderboard
  getLeaderboard(
    familyId?: string,
    period: 'week' | 'month' | 'year' = 'month'
  ): Observable<any[]> {
    // Use provided familyId or get from URL/user context
    const targetFamilyId = familyId || this.getFamilyIdFromContext();

    if (!targetFamilyId) {
      console.error('No family ID available for leaderboard');
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.http.get<any[]>(
      `${this.apiUrl}/leaderboard/${targetFamilyId}?period=${period}`
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
