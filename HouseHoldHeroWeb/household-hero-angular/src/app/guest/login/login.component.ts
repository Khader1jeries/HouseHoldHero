import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}

  onSubmit() {
    // Here you would normally validate credentials against backend
    // For demo purposes, we're just storing the email and redirecting

    // Store email in local storage or session for later use
    localStorage.setItem('userEmail', this.loginData.email);

    // Navigate to OTP verification
    this.router.navigate(['/guest/otp-verification'], { 
      queryParams: { email: this.loginData.email } 
    });
  }
}