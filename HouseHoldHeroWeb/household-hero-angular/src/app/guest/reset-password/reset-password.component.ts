import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

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

    // Reset password
    this.userService.resetPassword(this.email, this.newPassword)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          if (response.success) {
            this.successMessage = 'Your password has been reset successfully';
            
            // Clean up
            localStorage.removeItem('resetEmail');
            
            // Navigate back to login after a brief delay
            setTimeout(() => {
              this.router.navigate(['/guest/login']);
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Failed to reset password';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'An error occurred';
          console.error('Reset password error:', error);
        }
      });
  }
}