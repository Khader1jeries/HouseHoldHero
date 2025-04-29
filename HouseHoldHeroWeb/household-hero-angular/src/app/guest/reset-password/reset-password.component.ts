import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  verificationCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Retrieve the email from local storage
    const storedEmail = localStorage.getItem('resetEmail');
    if (storedEmail) {
      this.email = storedEmail;
    } else {
      // If no email is found, redirect back to forgot password
      this.router.navigate(['/guest/forgot-password']);
    }
  }

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.isSubmitting = false;
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      this.isSubmitting = false;
      return;
    }

    if (this.verificationCode.length !== 4) {
      this.errorMessage = 'Please enter the 4-digit verification code';
      this.isSubmitting = false;
      return;
    }

    // Simulate API call to verify code and update password
    setTimeout(() => {
      // For demo purposes, accept any 4-digit code
      const isCodeValid = this.verificationCode.length === 4;
      
      if (isCodeValid) {
        // In a real app, this would update the password in your database
        console.log(`Resetting password for ${this.email}`);
        this.successMessage = 'Your password has been reset successfully';
        
        // Clean up
        localStorage.removeItem('resetEmail');
        
        // Navigate back to login after a brief delay
        setTimeout(() => {
          this.router.navigate(['/guest/login']);
        }, 3000);
      } else {
        this.errorMessage = 'Invalid verification code';
        this.isSubmitting = false;
      }
    }, 1500);
  }
}