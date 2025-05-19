import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';

    // Validate input
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please enter both email and password';
      this.isSubmitting = false;
      return;
    }

    // Attempt login
    this.userService.loginUser(this.loginData.email, this.loginData.password)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          if (!response.success) {
            this.errorMessage = response.message || 'Login failed';
          }
          // If successful, the service will automatically redirect to the user dashboard
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'An error occurred during login';
          console.error('Login error:', error);
        }
      });
  }
}