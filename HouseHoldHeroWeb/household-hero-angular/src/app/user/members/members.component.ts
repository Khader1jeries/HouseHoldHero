// src/app/user/members/members.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MemberService, Member } from '../../services/member.service';
import { UserService } from '../../services/user.service';

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
  familyId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private memberService: MemberService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Check for query parameters
    this.route.queryParams.subscribe((params) => {
      if (params['view'] === 'leaderboard') {
        this.navigateToLeaderboard();
        return;
      }
    });

    // Get the user's family ID
    const user = this.userService.getCurrentUser();
    if (user && user.email) {
      this.familyId = user.email;
      this.loadMembers();
    } else {
      this.error = 'No family information found. Please log in again.';
      this.isLoading = false;
    }
  }

  loadMembers(): void {
    this.isLoading = true;
    this.error = null;

    // Use the member service to load family members
    this.memberService.getMembers(this.familyId || undefined).subscribe({
      next: (data) => {
        this.members = data;
        this.isLoading = false;

        // Sort members by score for the leaderboard
        if (data.length > 0) {
          this.topMembers = [...data].sort(
            (a, b) => (b.score || 0) - (a.score || 0)
          );
        }
      },
      error: (err) => {
        console.error('Error loading members:', err);
        this.error = 'Failed to load members. Please try again.';
        this.isLoading = false;
      },
    });
  }

  navigateToAddMember(): void {
    this.router.navigate(['/user/members/add']);
  }

  // Navigate to member details page
  navigateToMemberDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/user/members/details', id]);
    }
  }

  // Delete a member
  deleteMember(id: string | undefined, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    if (!id) return;

    if (confirm('Are you sure you want to delete this member?')) {
      this.memberService
        .deleteMember(id, this.familyId || undefined)
        .subscribe({
          next: () => {
            // Remove the member from our arrays
            this.members = this.members.filter((member) => member.id !== id);
            this.topMembers = this.topMembers.filter(
              (member) => member.id !== id
            );
          },
          error: (err) => {
            console.error('Error deleting member:', err);
            alert(
              'Failed to delete member. ' +
                (err.error?.error || 'Please try again.')
            );
          },
        });
    }
  }

  // Navigate to edit member page
  editMember(id: string | undefined, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    if (!id) return;

    // Navigate to edit member page
    this.router.navigate(['/user/members/edit', id]);
  }

  toggleLeaderboard(): void {
    this.showLeaderboard = !this.showLeaderboard;
  }

  navigateToLeaderboard(): void {
    this.router.navigate(['/user/members/leaderboard']);
  }

  // Helper methods for the template
  getTotalScore(): number {
    return this.members.reduce((sum, member) => sum + (member.score || 0), 0);
  }

  getAverageScore(): number {
    if (this.members.length === 0) return 0;
    return Math.round(this.getTotalScore() / this.members.length);
  }

  getActiveMembers(): number {
    return this.members.filter(
      (member) => member.activeTasks && member.activeTasks > 0
    ).length;
  }
}
