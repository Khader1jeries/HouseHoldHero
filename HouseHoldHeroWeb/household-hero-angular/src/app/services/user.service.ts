// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';

export interface User {
  uid?: string;
  email: string;
  fullName: string;
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

  constructor(private http: HttpClient, private router: Router) {}

  // Register a new user - without automatic redirection
  registerUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register-simple`, user).pipe(
      map(response => {
        if (response.success && response.user) {
          // Just return success without storing user or redirecting
          return { success: true, user: response.user };
        }
        return response;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return of({ 
          success: false, 
          message: error.error?.message || 'Registration failed' 
        });
      })
    );
  }

  // Login user with proper redirection
  loginUser(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login-simple`, { email, password }).pipe(
      tap(response => {
        if (response.success && response.user) {
          // Store user in localStorage
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          // Navigate to user dashboard
          this.router.navigate(['/user']);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({ 
          success: false, 
          message: error.error?.message || 'Invalid email or password' 
        });
      })
    );
  }

  // Logout user
  logoutUser(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/guest/login']);
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  // Create a new family
  createFamily(familyName: string, uid: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-family`, { 
      name: familyName, 
      admin: uid 
    });
  }

  // Update user profile
  updateUserProfile(user: Partial<User>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${user.uid}`, user);
  }

  // Check if email exists
  checkEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-email`, { email });
  }

  // Reset password directly
  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password-simple`, { 
      email, 
      newPassword 
    });
  }
}