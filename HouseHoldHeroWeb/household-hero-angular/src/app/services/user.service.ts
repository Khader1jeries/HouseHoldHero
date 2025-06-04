import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, catchError, map } from 'rxjs';
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

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      map((response: any) => {
        // Optional: You can store user session data here
        if (response.success && response.user) {
          this.setCurrentUser(response.user);
        }
        return response;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return of({
          success: false,
          message: error.error?.message || 'Login failed',
        });
      })
    );
  }

  logoutUser(): void {}

  getCurrentUser(): User | null {
    return null;
  }

  isLoggedIn(): boolean {
    return false;
  }

  updateUserProfile(user: Partial<User>): Observable<any> {
    return of(null);
  }

  checkEmail(email: string): Observable<any> {
    return of(null);
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return of(null);
  }

  setCurrentUser(user: User): void {}

  getFamilyId(): string | null {
    return null;
  }

  ensureFamilyIdInUrl(familyId?: string): void {}

  navigateWithFamilyId(route: string[], additionalParams?: any): void {}
}
