import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private baseUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getTaskDistribution(adminEmail: string): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/task-distribution/${adminEmail}`
    );
  }

  getPointsByMember(
    adminEmail: string
  ): Observable<{ [fullName: string]: number }> {
    return this.http.get<{ [fullName: string]: number }>(
      `${this.baseUrl}/points-by-member/${adminEmail}`
    );
  }

  getTasksByStatus(adminEmail: string): Observable<{
    completed: number;
    inProgress: number;
    overDue: number;
    upcoming: number;
  }> {
    return this.http.get<{
      completed: number;
      inProgress: number;
      overDue: number;
      upcoming: number;
    }>(`${this.baseUrl}/tasks-by-status/${adminEmail}`);
  }

  getPointsEarnedOverTime(
    adminEmail: string
  ): Observable<{ [month: string]: number }> {
    return this.http.get<{ [month: string]: number }>(
      `${this.baseUrl}/points-earned-over-time/${adminEmail}`
    );
  }

  getCreatedOverTime(
    adminEmail: string
  ): Observable<{ [month: string]: number }> {
    return this.http.get<{ [month: string]: number }>(
      `${this.baseUrl}/created-over-time/${adminEmail}`
    );
  }

  getMemberPerformance(adminEmail: string): Observable<
    Array<{
      fullName: string;
      completedTasks: number;
      score: number;
      completionRate: number;
    }>
  > {
    return this.http.get<
      Array<{
        fullName: string;
        completedTasks: number;
        score: number;
        completionRate: number;
      }>
    >(`${this.baseUrl}/member-performance/${adminEmail}`);
  }
  downloadPdfReport(adminEmail: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/${adminEmail}`, {
      responseType: 'blob',
    });
  }
}
