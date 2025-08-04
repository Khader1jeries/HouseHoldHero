import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  // In a real application, you would use an actual API endpoint
  private apiUrl = 'https://api.yourdomain.com/email';

  constructor(private http: HttpClient) {}

  /**
   * Send OTP verification code to email
   * @param email The recipient email
   * @param purpose The purpose of the OTP (login, password-reset, etc.)
   * @returns Observable with success/error status
   */
  sendOtpVerification(
    email: string,
    purpose: string = 'login'
  ): Observable<any> {
    // In a real application, this would make an HTTP request to your backend
    // For demo purposes, we'll simulate a successful API call

    // This is where you'd make a real HTTP request:
    // return this.http.post(`${this.apiUrl}/send-otp`, { email, purpose });

    // Simulate API response
    return of({
      success: true,
      message: 'OTP code sent successfully',
    }).pipe(
      delay(1000) // Simulate network delay
    );
  }

  /**
   * Verify OTP code
   * @param email The recipient email
   * @param code The OTP code to verify
   * @param purpose The purpose of the OTP
   * @returns Observable with verification result
   */
  verifyOtpCode(
    email: string,
    code: string,
    purpose: string = 'login'
  ): Observable<any> {
    // In a real application, this would make an HTTP request to your backend
    // For demo purposes, we'll accept any code

    // This is where you'd make a real HTTP request:
    // return this.http.post(`${this.apiUrl}/verify-otp`, { email, code, purpose });

    // Simulate API response - for demo, any 4-digit code works
    return of({
      success: code.length === 4,
      message:
        code.length === 4 ? 'OTP verified successfully' : 'Invalid OTP code',
    }).pipe(
      delay(1000) // Simulate network delay
    );
  }

  /**
   * Reset user password
   * @param email User email
   * @param code Verification code
   * @param newPassword New password
   * @returns Observable with reset result
   */
  resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Observable<any> {
    // In a real application, this would make an HTTP request to your backend
    // For demo purposes, we'll simulate a successful password reset

    // This is where you'd make a real HTTP request:
    // return this.http.post(`${this.apiUrl}/reset-password`, { email, code, newPassword });

    // Simulate API response
    return of({
      success: true,
      message: 'Password reset successfully',
    }).pipe(
      delay(1500) // Simulate network delay
    );
  }
}
