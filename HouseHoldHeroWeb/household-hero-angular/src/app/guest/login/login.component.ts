// src/app/guest/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    this.userService.loginUser(email, password).subscribe({
      next: () => {
        this.router.navigate(['/user/index']);
      },
      error: (error) => {
        this.loading = false;
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password'
        ) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage =
            error.message || 'Login failed. Please try again.';
        }
      },
    });
  }

  navigateToRegistration(): void {
    this.router.navigate(['/guest/registration']);
  }

  forgotPassword(): void {
    if (!this.loginForm.get('email')?.valid) {
      this.errorMessage = 'Please enter a valid email first.';
      return;
    }

    const email = this.loginForm.value.email;
    this.userService.resetPassword(email).subscribe({
      next: () => {
        this.errorMessage = '';
        alert('Password reset email sent. Please check your inbox.');
      },
      error: (error) => {
        this.errorMessage = 'Failed to send reset email. Please try again.';
      },
    });
  }
}
