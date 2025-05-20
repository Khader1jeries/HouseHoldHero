import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent implements OnInit {
  // User data structure with separated first and last name
  user = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+972', // Default country code
  };

  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Get email from query params if available
    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.user.email = params['email'];
      }
    });
  }

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.isSubmitting = false;
      return;
    }

    if (this.user.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      this.isSubmitting = false;
      return;
    }

    // Create registration data with separate first/last name
    const registrationData = {
      ...this.user,
      // Keep fullName field for backward compatibility
      fullName: `${this.user.firstName} ${this.user.lastName}`,
    };

    // Register the user
    this.userService.registerUser(registrationData).subscribe({
      next: (response) => {
        if (response.success) {
          // Create family using the last name
          this.createFamily(response.user);
        } else {
          this.isSubmitting = false;
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message || 'An error occurred during registration';
        console.error('Registration error:', error);
      },
    });
  }

  // Create family after successful registration
  createFamily(user: any) {
    // Create family name with the user's last name, adding a unique ID to avoid conflicts
    const familyName = `${this.user.lastName} Family`;

    this.userService.createFamily(familyName, user.uid).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage =
            'Registration successful! Your family has been created. Redirecting to login...';
          // Redirect to login page after a short delay
          setTimeout(() => {
            this.router.navigate(['/guest/login']);
          }, 2000);
        } else {
          // Even if family creation fails, let the user continue to login
          this.successMessage =
            'Registration successful! Redirecting to login...';
          console.error('Family creation issue:', response.message);
          setTimeout(() => {
            this.router.navigate(['/guest/login']);
          }, 2000);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        // Still consider registration successful, just log the family creation error
        this.successMessage =
          'Registration successful! Redirecting to login...';
        console.error('Family creation error:', error);
        setTimeout(() => {
          this.router.navigate(['/guest/login']);
        }, 2000);
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/guest/login']);
  }
}
