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
    countryCode: '+972',
    password: '',
    confirmPassword: '',
    age: null as number | null,
    role: 'member',
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

  onSubmit(): void {}

  cancel(): void {}
}
