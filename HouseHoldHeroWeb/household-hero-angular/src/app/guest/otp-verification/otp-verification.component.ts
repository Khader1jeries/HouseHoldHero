import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css',
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  email: string = '';
  otpDigits: string[] = ['', '', '', ''];
  remainingTime: number = 60; // 1 minute in seconds
  timerInterval: any = null;
  canResend: boolean = false;
  isVerifying: boolean = false;
  errorMessage: string = '';
  isBrowser: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Get email from query params
    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.email = params['email'];
      } else if (this.isBrowser) {
        // Only access localStorage in the browser
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
          this.email = storedEmail;
        }
      }
    });

    // Only start timer and send OTP in browser environment
    if (this.isBrowser) {
      // Start the countdown timer
      this.startTimer();

      // Send OTP code
      this.sendOtpCode();
    }
  }

  ngOnDestroy() {
    // Clear the timer when component is destroyed
    this.clearTimer();
  }

  startTimer() {
    this.remainingTime = 60;
    this.canResend = false;

    // Clear any existing timer
    this.clearTimer();

    // Start a new timer
    this.timerInterval = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        this.clearTimer();
        this.canResend = true;
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  sendOtpCode() {
    // In a real application, this would call an API to send an OTP
    console.log(`Sending OTP to ${this.email}`);
    // For demo purposes, let's assume the OTP is "1234"
  }

  resendOtp() {
    if (this.canResend) {
      this.errorMessage = '';
      this.sendOtpCode();
      this.startTimer();
    }
  }

  // Handle input changes and auto-focus to next input
  onOtpDigitChange(index: number, event: any) {
    const digit = event.target.value;

    // Only allow single digit
    if (digit.length > 1) {
      this.otpDigits[index] = digit.charAt(0);
    }

    // Auto-focus to next input if value entered
    if (digit && index < 3) {
      const nextInput = event.target.nextElementSibling;
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Check if all digits are filled
    this.checkOtpCompletion();
  }

  checkOtpCompletion() {
    const otp = this.otpDigits.join('');

    // If all digits are filled, automatically verify OTP
    if (otp.length === 4 && !this.isVerifying) {
      this.verifyOtp();
    }
  }

  verifyOtp() {
    const otp = this.otpDigits.join('');
    if (otp.length !== 4) {
      this.errorMessage = 'Please enter the complete 4-digit code';
      return;
    }

    this.isVerifying = true;
    this.errorMessage = '';

    // For demo purposes, we'll accept "1234" as valid
    setTimeout(() => {
      if (otp === '1234') {
        console.log('OTP verified successfully');

        // Mark user as authenticated (only in browser)
        if (this.isBrowser) {
          localStorage.setItem('isAuthenticated', 'true');
        }

        // Navigate to user dashboard
        this.router.navigate(['/user']);
      } else {
        this.errorMessage = 'Invalid verification code. Please try again.';
        this.isVerifying = false;
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  submitOtp() {
    this.verifyOtp();
  }
}
