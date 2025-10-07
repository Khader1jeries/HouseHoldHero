import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService } from '../../../services/member.service';
import { Member } from '../../../services/interfaces/member.interface';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.css',
})
export class MemberDetailsComponent implements OnInit {
  memberId: string = '';
  member?: Member;

  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.loadMemberData();
  }

  loadMemberData(): void {
    const memberEmail = this.route.snapshot.paramMap.get('id');

    if (!memberEmail) {
      console.error('❌ Missing memberEmail');
      this.error = 'Missing member information.';
      this.isLoading = false;
      return;
    }

    this.memberService.getMemberByEmail(memberEmail).subscribe({
      next: (memberData) => {
        this.member = memberData;
        this.memberId = memberEmail;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching member data:', err);
        this.error = 'Failed to load member details.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Format phone number for display
   */
  getFormattedPhone(): string {
    if (!this.member) return '';
    return `${this.member.countryCode} ${this.member.phoneNumber}`;
  }

  /**
   * Get completion rate as a formatted percentage
   */
  getCompletionRateFormatted(): string {
    if (!this.member || !this.member.completionRate) return '0%';
    return `${this.member.completionRate.toFixed(1)}%`;
  }

  /**
   * Navigate back to members list
   */
  goBack(): void {
    this.router.navigate(['/user/members']);
  }

  /**
   * Reload member data
   */
  refreshMemberData(): void {
    this.isLoading = true;
    this.error = null;
    this.loadMemberData();
  }
}
