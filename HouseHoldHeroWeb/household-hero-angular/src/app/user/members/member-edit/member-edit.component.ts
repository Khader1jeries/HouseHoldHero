// src/app/user/members/member-edit/member-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService, Member } from '../../../services/member.service';

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css',
})
export class MemberEditComponent implements OnInit {
  memberId: string = '';
  member: Member = {
    id: '',
    fullName: '',
    email: '',
    phone: '',
    age: 0,
    role: 'Family Member',
    profileImage: 'assets/profile_pic.png',
    score: 0,
  };

  availableRoles: string[] = ['Family Member', 'Admin', 'Guest'];
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    // Get the member ID from the route parameters
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.memberId = params['id'];
        this.loadMemberData();
      }
    });
  }

  loadMemberData(): void {
    this.isLoading = true;
    // Get member data from the service
    this.memberService.getMemberById(this.memberId).subscribe({
      next: (data) => {
        this.member = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading member data:', err);
        this.errorMessage =
          'Failed to load member data. Please try again later.';
        this.isLoading = false;

        // After a delay, navigate back to the members list
        setTimeout(() => {
          this.router.navigate(['/user/members']);
        }, 3000);
      },
    });
  }

  uploadProfilePicture(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // In a real app, this would upload the file to a server
      console.log('Uploading file:', file.name);

      // Mock success after a delay
      setTimeout(() => {
        // Mock a new profile picture URL (we'll use the same one for demo)
        this.member.profileImage = 'assets/profile_pic.png';
        this.successMessage = 'Profile picture updated';

        // Clear the success message after a few seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }, 1500);
    }
  }

  saveMember(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (!this.member.fullName || !this.member.email) {
      this.errorMessage = 'Name and Email are required';
      this.isSubmitting = false;
      return;
    }

    // Prepare data for update
    const updateData: Partial<Member> = {
      fullName: this.member.fullName,
      email: this.member.email,
      phone: this.member.phone,
      age: this.member.age,
      role: this.member.role,
      profileImage: this.member.profileImage,
    };

    // Call the service to update the member
    this.memberService.updateMember(this.memberId, updateData).subscribe({
      next: (response) => {
        console.log('Member updated:', response);
        this.successMessage = 'Member updated successfully';
        this.isSubmitting = false;

        // Navigate back to the member details page after a delay
        setTimeout(() => {
          this.router.navigate(['/user/members/details', this.memberId]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error updating member:', err);
        this.errorMessage =
          err.error?.error || 'Failed to update member. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/user/members/details', this.memberId]);
  }
}
