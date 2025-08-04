import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { Member } from '../../services/interfaces/member.interface';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit {
  members: Member[] = [];
  topMembers: Member[] = [];
  showLeaderboard: boolean = true;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('❌ Missing email in queryParams');
      return;
    }

    this.memberService.getMembers(adminEmail).subscribe({
      next: (members) => {
        this.members = members;
        this.topMembers = [...members]
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, 3);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching members:', err);
        this.error = 'Failed to load members.';
        this.isLoading = false;
      },
    });
  }

  navigateToAddMember(): void {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (adminEmail) {
      this.router.navigate(['/user/members/add']);
    } else {
      console.error('Admin email not found in route');
    }
  }

  navigateToMemberDetails(memberEmail: string | undefined): void {
    if (!memberEmail) {
      console.error('❌ Member email is required');
      return;
    }

    this.router.navigate(['/user/members/details', memberEmail]);
  }

  deleteMember(email: string, event: Event): void {
    // Prevent event bubbling (so clicking delete doesn't trigger row click)
    event.stopPropagation();

    // Check if id exists
    if (!email) {
      console.error('Member ID is required');
      return;
    }

    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('Admin email not found');
      return;
    }

    // Optional: Show confirmation dialog
    if (confirm('Are you sure you want to delete this member?')) {
      this.memberService.deleteMember(email).subscribe({
        next: (response) => {
          // Refresh the members list
          this.loadMembers();
        },
        error: (error) => {
          console.error('Error deleting member:', error);
          // Show error message to user
        },
      });
    }
  }

  toggleLeaderboard(): void {
    this.showLeaderboard = !this.showLeaderboard;
  }

  navigateToLeaderboard(): void {
    this.router.navigate(['/user/members/leaderboard']);
  }

  getTotalScore(): number {
    return this.members.reduce(
      (total, member) => total + (member.score || 0),
      0
    );
  }

  getAverageScore(): number {
    if (this.members.length === 0) return 0;

    return Math.round(this.getTotalScore() / this.members.length);
  }

  getActiveMembers(): number {
    return this.members.length;
  }
  getAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }
}
