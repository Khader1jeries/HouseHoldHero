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
  // User data structure
  user = {
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+972', // Default country code
  };

  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Get email from query params if available
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.user.email = params['email'];
      }
    });
  }

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';

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

    // Register the user
    this.userService.registerUser(this.user).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        if (!response.success) {
          this.errorMessage = response.message || 'Registration failed';
        }
        // If successful, the service will automatically redirect to the user dashboard
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'An error occurred during registration';
        console.error('Registration error:', error);
      }
    });
  }
  
  navigateToLogin() {
    this.router.navigate(['/guest/login']);
  }
}