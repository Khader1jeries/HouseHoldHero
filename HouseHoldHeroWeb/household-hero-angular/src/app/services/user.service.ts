import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
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

  private loadUserFromStorage(): void {
    if (this.isBrowser) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        const user: User = JSON.parse(userJson);
        this.currentUser = user;
        this.currentUserSubject.next(user);
      }
    }
  }

  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  fetchUserData(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${encodeURIComponent(email)}`);
  }

  checkEmail(email: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/forgot-password/${encodeURIComponent(email)}`
    );
  }

  resetPassword(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  logoutUser(): void {}

  isLoggedIn(): boolean {
    return false;
  }

  setCurrentUser(email: string): void {
    this.fetchUserData(email).subscribe({
      next: (user: User) => {
        this.currentUser = user;

        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }

        this.currentUserSubject.next(user);
      },
      error: (err) => {
        console.error('❌ Failed to fetch user by email:', err);
      },
    });
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    if (this.isBrowser) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
        this.currentUserSubject.next(this.currentUser); // keep observable in sync
      }
    }

    return this.currentUser;
  }

  updateUserProfile(user: Partial<User>): Observable<any> {
    return of({});
  }

  getUserEmail(): string | null {
    return null;
  }

  ensureEmailInUrl(email?: string): void {}

  navigateWithEmail(route: string[], additionalParams?: any): void {}
  setCurrentUserObject(user: User): void {
    this.currentUser = user;
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }
}
