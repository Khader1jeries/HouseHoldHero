import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './user.service';
import { Member } from './interfaces/member.interface';
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
  createMember(member: Member): Observable<Member> {
    const memberData = {
      ...member,
    };
    return this.http.post<Member>(this.apiUrl, memberData);
  }
  getMembers(adminEmail: string): Observable<Member[]> {
    const params = new HttpParams().set('adminEmail', adminEmail);
    return this.http.get<Member[]>(this.apiUrl, { params });
  }
  getMemberByEmail(memberEmail: string): Observable<Member> {
    const encodedEmail = encodeURIComponent(memberEmail);
    return this.http.get<Member>(`${this.apiUrl}/${encodedEmail}`);
  }
  getMonthlyLeaderboard(adminEmail: string): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/monthly-leaderboard/${adminEmail}`)
      .pipe(map((res) => Object.values(res.data || {})));
  }
  getYearlyLeaderboard(adminEmail: string): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/yearly-leaderboard/${adminEmail}`)
      .pipe(map((res) => Object.values(res.data || {})));
  }
  getLeaderboard(adminEmail: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/leaderboard/${adminEmail}`);
  }
  deleteMember(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${email}`);
  }
  getTwoMembers(adminEmail: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/getTwo/${adminEmail}`);
  }
}
