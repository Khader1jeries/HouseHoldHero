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
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
    rememberMe: false,
  };

  errorMessage: string = '';
  isSubmitting: boolean = false;
  successMessage: string = '';

  constructor(private router: Router, private userService: UserService) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    const email = this.loginData.email.toLowerCase();
    const password = this.loginData.password;

    this.userService.loginUser(email, password).subscribe({
      next: (res) => {
        this.successMessage = 'Login successful!';
        this.isSubmitting = false;
        this.userService.setCurrentUser(email);
        // Optional: navigate after 2s or save user info
        this.router.navigate(['/user']);
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Invalid credentials or server error.';
        this.isSubmitting = false;
      },
    });
  }
}
