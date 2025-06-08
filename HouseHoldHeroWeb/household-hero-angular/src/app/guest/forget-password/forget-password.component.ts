import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgotPasswordComponent {
  currentStep: 'email' | 'reset' = 'email';

  emailData = {
    email: '',
  };

  resetData = {
    newPassword: '',
    confirmPassword: '',
  };

  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private router: Router, private userService: UserService) {}

  onCheckEmail(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    const email = this.emailData.email.toLowerCase();

    this.userService.checkEmail(email).subscribe({
      next: (res) => {
        // Assume backend returns success if email exists
        this.successMessage = 'Email found. Please reset your password.';
        this.currentStep = 'reset';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Email not found.';
        this.isSubmitting = false;
      },
    });
  }

  onResetPassword(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.resetData.newPassword !== this.resetData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    const payload = {
      email: this.emailData.email.toLowerCase(),
      password: this.resetData.newPassword,
    };

    this.userService.resetPassword(payload).subscribe({
      next: () => {
        this.successMessage = 'Password reset successful!';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/guest/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to reset password.';
        this.isSubmitting = false;
      },
    });
  }

  goBackToEmail(): void {
    this.currentStep = 'email';
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = false;
  }
}
