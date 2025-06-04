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
        if (response.success) {
          // Create user object since backend doesn't return it
          const user: User = {
            email: email,
            firstName: '',
            lastName: '',
            fullName: email,
          };

          console.log('🔍 Setting user:', user);
          this.setCurrentUser(user);
          console.log('🔍 User after setting:', this.getCurrentUser());
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

  logoutUser(): void {
    // Clear the user from BehaviorSubject
    this.currentUserSubject.next(null);

    // Optionally clear from local storage if you're storing user info there
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }

    // Redirect to login page
    this.router.navigate(['/guest/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  updateUserProfile(user: Partial<User>): Observable<any> {
    return of(null);
  }
  checkEmail(email: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/check-email`, {
        params: { email },
      })
      .pipe(
        map((response: any) => response),
        catchError((error) => {
          console.error('Check email error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to check email',
          });
        })
      );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/reset-password`, {
        email,
        password: newPassword,
      })
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError((error) => {
          console.error('Reset password error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to reset password',
          });
        })
      );
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  getFamilyId(): string | null {
    return null;
  }

  ensureFamilyIdInUrl(familyId?: string): void {}

  navigateWithFamilyId(route: string[], additionalParams?: any): void {}
}
