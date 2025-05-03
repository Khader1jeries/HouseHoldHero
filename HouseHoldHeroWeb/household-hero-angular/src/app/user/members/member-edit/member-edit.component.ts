// src/app/user/members/member-edit/member-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  role: string;
  profileImage: string;
}

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
    name: '',
    email: '',
    phone: '',
    age: 0,
    role: 'Family Member',
    profileImage: 'assets/profile_pic.png',
  };

  availableRoles: string[] = ['Family Member', 'Admin', 'Guest'];
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

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
    // In a real app, this would call a service to get the data
    // For now, we'll use mock data
    const mockMembers: { [key: string]: Member } = {
      '1': {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+972 55-555-5555',
        age: 23,
        role: 'Family Member',
        profileImage: 'assets/profile_pic.png',
      },
      '2': {
        id: '2',
        name: 'Kavin Smith',
        email: 'kavin@example.com',
        phone: '+972 55-444-4444',
        age: 21,
        role: 'Family Member',
        profileImage: 'assets/profile_pic.png',
      },
      '3': {
        id: '3',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+972 55-333-3333',
        age: 27,
        role: 'Family Member',
        profileImage: 'assets/profile_pic.png',
      },
    };

    if (mockMembers[this.memberId]) {
      this.member = { ...mockMembers[this.memberId] };
    }
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
    if (!this.member.name || !this.member.email) {
      this.errorMessage = 'Name and Email are required';
      this.isSubmitting = false;
      return;
    }

    // In a real app, this would call a service to save the data
    setTimeout(() => {
      console.log('Saving member:', this.member);
      this.successMessage = 'Member updated successfully';
      this.isSubmitting = false;

      // Navigate back to the member details page after a delay
      setTimeout(() => {
        this.router.navigate(['/user/members', this.memberId]);
      }, 2000);
    }, 1500);
  }

  cancel(): void {
    this.router.navigate(['/user/members', this.memberId]);
  }
}
