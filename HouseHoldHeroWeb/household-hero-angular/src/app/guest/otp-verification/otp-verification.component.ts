// src/app/guest/otp-verification/otp-verification.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css',
})
export class OtpVerificationComponent implements OnInit {
  email: string = '';
  otpForm: FormGroup;
  timeLeft: number = 120; // 2 minutes countdown
  timerDisplay: string = '02:00';
  resendDisabled: boolean = true;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.email = params['email'];
      } else {
        // Redirect if no email provided
        this.router.navigate(['/guest/login']);
      }
    });

    this.startTimer();
    this.setupOtpInputs();
  }

  // Auto-focus on next input after filling one
  setupOtpInputs(): void {
    const inputs = document.querySelectorAll<HTMLInputElement>('.otp-input');
    inputs.forEach((input, index) => {
      input.addEventListener('keyup', (e) => {
        const target = e.target as HTMLInputElement;
        const key = e.key;

        // Move to next input if current is filled
        if (key !== 'Backspace' && target.value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }

        // Move to previous input on backspace
        if (key === 'Backspace' && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });
  }

  // Timer for OTP expiration
  startTimer(): void {
    const timer = setInterval(() => {
      this.timeLeft--;

      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;

      this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;

      if (this.timeLeft <= 0) {
        clearInterval(timer);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  // Combine all digits and submit OTP
  onSubmit(): void {
    if (this.otpForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const otp =
      this.otpForm.get('digit1')?.value +
      this.otpForm.get('digit2')?.value +
      this.otpForm.get('digit3')?.value +
      this.otpForm.get('digit4')?.value;

    // In a real app, you would verify this OTP with your backend
    // For now, we'll just simulate verification and redirect
    setTimeout(() => {
      this.loading = false;
      // Success - redirect to login or dashboard
      this.router.navigate(['/guest/login']);
    }, 1500);
  }

  // Resend OTP
  resendOtp(): void {
    if (this.resendDisabled) {
      return;
    }

    this.userService.sendVerificationEmail().subscribe({
      next: () => {
        // Reset timer
        this.timeLeft = 120;
        this.resendDisabled = true;
        this.startTimer();

        // Reset form
        this.otpForm.reset();
      },
      error: (error) => {
        this.errorMessage =
          'Failed to resend verification code. Please try again.';
      },
    });
  }
}
