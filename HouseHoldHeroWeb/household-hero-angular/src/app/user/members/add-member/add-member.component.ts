// src/app/user/members/add-member/add-member.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MemberService } from '../../../services/member.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.css',
})
export class AddMemberComponent {
  newMember = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+972', // Default for Israel
    password: '',
    confirmPassword: '',
    age: null as number | null,
    role: 'member', // Default role
    profileImage: 'assets/profile_pic.png',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private memberService: MemberService,
    private userService: UserService
  ) {}

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (!this.newMember.firstName || !this.newMember.lastName) {
      this.errorMessage = 'First name and last name are required';
      this.isSubmitting = false;
      return;
    }

    if (!this.newMember.email) {
      this.errorMessage = 'Email is required';
      this.isSubmitting = false;
      return;
    }

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

    // Get the current user's family ID
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !currentUser.familyId) {
      this.errorMessage = 'No family information found. Please log in again.';
      this.isSubmitting = false;
      return;
    }

    // Prepare member data with fullName constructed from firstName and lastName
    const fullName = `${this.newMember.firstName} ${this.newMember.lastName}`;

    const memberData: any = {
      ...this.newMember,
      fullName: fullName, // Explicitly set fullName
      familyId: currentUser.familyId,
      phone: `${this.newMember.countryCode} ${this.newMember.phoneNumber}`,
      createdAt: new Date(),
      score: 0,
      completionRate: 0,
      lastActive: new Date(),
    };

    // Call the service to create the member
    console.log('Sending member data to server:', memberData);
    this.memberService.createMember(memberData).subscribe({
      next: (response) => {
        console.log('Member added:', response);
        this.successMessage = 'Member added successfully!';
        this.isSubmitting = false;

        // Redirect back to members list after a delay
        setTimeout(() => {
          this.router.navigate(['/user/members']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error adding member:', error);
        this.errorMessage =
          error.error?.error || 'Failed to add member. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  cancel() {
    this.router.navigate(['/user/members']);
  }
}
