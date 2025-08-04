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
  user = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+972',
    DOB: new Date(),
  };

  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;
    this.user.email = this.user.email.toLowerCase();

    const userToRegister = {
      ...this.user,
      createdAt: new Date(),
    };

    this.userService.registerUser(userToRegister).subscribe({
      next: (res) => {
        this.successMessage = 'Registration successful!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/guest/login']);
        }, 2000); // 2 seconds delay
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
        this.isSubmitting = false;
      },
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/guest/login']);
  }
}
