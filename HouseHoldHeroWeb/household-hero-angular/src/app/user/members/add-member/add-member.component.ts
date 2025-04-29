// src/app/user/members/add-member/add-member.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.css',
})
export class AddMemberComponent {
  newMember = {
    fullName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+972', // Default for Israel
    password: '',
    confirmPassword: '',
    age: null as number | null,
    role: 'member', // Default role
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (this.newMember.password !== this.newMember.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.isSubmitting = false;
      return;
    }

    if (this.newMember.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      this.isSubmitting = false;
      return;
    }

    if (!this.newMember.age || this.newMember.age < 1) {
      this.errorMessage = 'Please enter a valid age';
      this.isSubmitting = false;
      return;
    }

    // Simulate API call to register member
    setTimeout(() => {
      console.log('Adding new member:', this.newMember);
      this.successMessage = 'Member added successfully!';
      this.isSubmitting = false;

      // Redirect back to members list after a delay
      setTimeout(() => {
        this.router.navigate(['/user/members']);
      }, 2000);
    }, 1500);
  }

  cancel() {
    this.router.navigate(['/user/members']);
  }
}
