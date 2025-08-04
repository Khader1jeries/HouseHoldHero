import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
    email: '',
    adminEmail: '',
    countryCode: '',
    createdAt: new Date(),
    firstName: '',
    lastName: '',
    phoneNumber: '',
    confirmPassword: '',
    password: '',
    DOB: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router, private memberService: MemberService) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    // Check password match
    if (this.newMember.password !== this.newMember.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.isSubmitting = false;
      return;
    }

    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      this.errorMessage = 'Admin email not found in URL.';
      this.isSubmitting = false;
      return;
    }
    this.newMember.adminEmail = adminEmail;
    this.newMember.createdAt = new Date();
    // Remove confirmPassword before sending
    const { confirmPassword, ...member } = this.newMember;

    // Call service with correct parameters
    this.memberService.createMember(member).subscribe({
      next: () => {
        this.successMessage = 'Member added successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['user/members'], {
            queryParams: { email: adminEmail },
          });
        }, 1500);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to add member. Please try again.';
        console.error(error);
        this.isSubmitting = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/user/members']);
  }
}
