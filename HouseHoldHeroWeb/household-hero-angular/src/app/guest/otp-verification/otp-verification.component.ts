import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css',
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  @ViewChildren('digit1, digit2, digit3, digit4')
  digitInputs!: QueryList<ElementRef>;

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
        } else {
          // If no email found, redirect back to login
          this.router.navigate(['/guest/login']);
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
      const inputs = this.digitInputs.toArray();
      if (inputs[index + 1]) {
        inputs[index + 1].nativeElement.focus();
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
          // Set authentication token that AuthGuard will recognize
          localStorage.setItem('isAuthenticated', 'true');

          // Also store user data if needed by the user component
          const userEmail = this.email;
          localStorage.setItem(
            'currentUser',
            JSON.stringify({ email: userEmail })
          );

          // Add a small delay before navigation to ensure localStorage is updated
          setTimeout(() => {
            // Navigate to user dashboard
            this.router.navigate(['/user']);
          }, 100);
        }
      } else {
        this.errorMessage = 'Invalid verification code. Please try again.';
        this.isVerifying = false;
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    return `${seconds}`;
  }

  submitOtp() {
    this.verifyOtp();
  }
}
