// src/app/guest/registration/registration.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        countryCode: ['+972', Validators.required],
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(/^\d{9,10}$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  // Custom validator to ensure passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      Object.keys(this.registrationForm.controls).forEach((key) => {
        this.registrationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const userData: User = {
      email: this.registrationForm.value.email,
      fullName: this.registrationForm.value.fullName,
      phoneNumber: this.registrationForm.value.phoneNumber,
      countryCode: this.registrationForm.value.countryCode,
    };

    this.userService
      .registerUser(userData, this.registrationForm.value.password)
      .subscribe({
        next: () => {
          // Send verification email
          this.userService.sendVerificationEmail().subscribe();

          // Redirect to OTP verification
          this.router.navigate(['/guest/otp-verification'], {
            queryParams: { email: userData.email },
          });
        },
        error: (error) => {
          this.loading = false;
          if (error.code === 'auth/email-already-in-use') {
            this.errorMessage = 'This email is already registered.';
          } else {
            this.errorMessage =
              error.message || 'Registration failed. Please try again.';
          }
        },
      });
  }

  navigateToLogin() {
    this.router.navigate(['/guest/login']);
  }
}
