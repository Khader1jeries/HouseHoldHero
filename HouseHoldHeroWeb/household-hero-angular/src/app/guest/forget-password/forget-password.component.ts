import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Here you would normally check if the email exists in your database
    // For demo purposes, we'll simulate a database check
    setTimeout(() => {
      const emailExists = true; // Simulate that email exists
      
      if (emailExists) {
        // In a real app, this would trigger sending a verification code
        console.log(`Sending verification code to ${this.email}`);
        this.successMessage = 'Verification code sent to your email';
        
        // Store the email for the reset password page
        localStorage.setItem('resetEmail', this.email);
        
        // Navigate to reset password page after a brief delay
        setTimeout(() => {
          this.router.navigate(['/guest/reset-password']);
        }, 2000);
      } else {
        this.errorMessage = 'Email not found in our records';
      }
      
      this.isSubmitting = false;
    }, 1500); // Simulate API delay
  }
}