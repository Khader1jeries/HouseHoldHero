// src/app/services/user.service.ts - Updated to use URL parameters for family ID
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  uid?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber?: string;
  countryCode?: string;
  role?: 'admin' | 'user';
  familyId?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private isBrowser: boolean;

  // Use BehaviorSubject to store user data in memory
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Register a new user
  registerUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register-simple`, user).pipe(
      map((response) => {
        if (response.success && response.user) {
          return { success: true, user: response.user };
        }
        return response;
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return of({
          success: false,
          message: error.error?.message || 'Registration failed',
        });
      })
    );
  }

  // Create a new family
  createFamily(familyName: string, uid: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/create-family`, {
        name: familyName,
        admin: uid,
      })
      .pipe(
        map((response) => {
          console.log('Family creation response:', response);
          return response;
        }),
        catchError((error) => {
          console.error('Create family error:', error);
          return of({
            success: false,
            message:
              error.error?.message ||
              `Failed to create family: ${error.message || 'Unknown error'}`,
          });
        })
      );
  }

  // Login user and store in memory with URL navigation
  loginUser(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login-simple`, { email, password })
      .pipe(
        tap((response) => {
          if (response.success && response.user) {
            // Store user in memory using BehaviorSubject
            this.currentUserSubject.next(response.user);

            // Navigate to user dashboard with family ID in URL
            if (response.user.familyId) {
              this.router.navigate(['/user'], {
                queryParams: { familyId: response.user.familyId },
              });
            } else {
              // If no family ID, go to user page without family context
              this.router.navigate(['/user']);
            }
          }
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Invalid email or password',
          });
        })
      );
  }

  // Logout user
  logoutUser(): void {
    // Clear user from memory
    this.currentUserSubject.next(null);
    this.router.navigate(['/guest/login']);
  }

  // Get current user from memory (BehaviorSubject)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  // Update user profile and refresh in-memory data
  updateUserProfile(user: Partial<User>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${user.uid}`, user).pipe(
      tap(() => {
        // Update the in-memory user data
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          this.currentUserSubject.next({ ...currentUser, ...user });
        }
      })
    );
  }

  // Check if email exists
  checkEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-email`, { email });
  }

  // Reset password directly
  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password-simple`, {
      email,
      newPassword,
    });
  }

  // Set user data manually (useful for testing or initialization)
  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  // Get user's family ID from URL first, then fallback to user data
  getFamilyId(): string | null {
    if (this.isBrowser) {
      // Try to get family ID from current URL
      const urlParams = new URLSearchParams(window.location.search);
      const familyIdFromUrl = urlParams.get('familyId');

      if (familyIdFromUrl) {
        return familyIdFromUrl;
      }
    }

    // Fallback to user data
    const user = this.getCurrentUser();
    return user?.familyId || null;
  }

  // Helper method to ensure family ID is in URL
  ensureFamilyIdInUrl(familyId?: string): void {
    const targetFamilyId = familyId || this.getCurrentUser()?.familyId;

    if (targetFamilyId && this.isBrowser) {
      const currentUrl = new URL(window.location.href);
      const currentFamilyId = currentUrl.searchParams.get('familyId');

      if (currentFamilyId !== targetFamilyId) {
        currentUrl.searchParams.set('familyId', targetFamilyId);
        window.history.replaceState({}, '', currentUrl.toString());
      }
    }
  }

  // Navigate with family ID preserved
  navigateWithFamilyId(route: string[], additionalParams?: any): void {
    const familyId = this.getFamilyId();
    const queryParams = additionalParams || {};

    if (familyId) {
      queryParams.familyId = familyId;
    }

    this.router.navigate(route, { queryParams });
  }
}
