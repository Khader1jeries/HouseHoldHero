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

  ngOnInit(): void {}

  loadMemberData(): void {}

  uploadProfilePicture(event: any): void {}

  saveMember(): void {}

  cancel(): void {}
}
