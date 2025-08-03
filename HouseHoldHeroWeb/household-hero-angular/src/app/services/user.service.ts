import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { isPlatformBrowser } from '@angular/common';
import { User } from './interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private isBrowser: boolean;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private currentUser: User | null = null;
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {}

  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  checkEmail(email: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/forgot-password/${encodeURIComponent(email)}`
    );
  }

  resetPassword(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  logoutUser(): void {
    this.currentUser = null;
    this.currentUserSubject.next(null);

    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
  }

  isLoggedIn(): boolean {
    return false;
  }

  getCurrentUser(email: string): Observable<User> {
    return this.http
      .get<{ success: boolean; user: User }>(
        `${this.apiUrl}/${encodeURIComponent(email)}`
      )
      .pipe(map((response) => response.user));
  }

  updateUserProfile(user: Partial<User>): Observable<any> {
    const email = user.email;
    if (!email) throw new Error('User email is required');

    // Clone and remove email before sending body
    const body = { ...user };
    delete body.email;

    return this.http.put(`${this.apiUrl}/${email}`, body);
  }
  deleteUser(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-user/${email}`);
  }
  verficationCheck(email: string, verfication: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/forgot-password/${email}/${verfication}`
    );
  }
}
