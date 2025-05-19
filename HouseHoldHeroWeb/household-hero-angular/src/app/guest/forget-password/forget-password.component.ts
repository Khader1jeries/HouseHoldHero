import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      this.isSubmitting = false;
      return;
    }

    // Check if email exists
    this.userService.checkEmail(this.email)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          if (response.success && response.exists) {
            this.successMessage = 'Email found! Redirecting to reset password...';
            
            // Store the email for the reset password page
            localStorage.setItem('resetEmail', this.email);
            
            // Navigate to reset password page after a brief delay
            setTimeout(() => {
              this.router.navigate(['/guest/reset-password']);
            }, 2000);
          } else {
            this.errorMessage = 'Email not found in our records';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'An error occurred. Please try again later.';
          console.error('Check email error:', error);
        }
      });
  }
  
  navigateToLogin() {
    this.router.navigate(['/guest/login']);
  }
}