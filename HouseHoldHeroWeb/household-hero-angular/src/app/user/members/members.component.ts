// src/app/user/members/members.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MemberService, Member } from '../../services/member.service';

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

  constructor(private router: Router, private memberService: MemberService) {}

  ngOnInit(): void {
    this.loadMembers();
    this.loadLeaderboard();
  }

  loadMembers(): void {
    this.isLoading = true;
    this.memberService.getMembers().subscribe({
      next: (data) => {
        this.members = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading members:', err);
        this.error = 'Failed to load members. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  loadLeaderboard(): void {
    this.memberService.getLeaderboard().subscribe({
      next: (data) => {
        this.topMembers = data;
      },
      error: (err) => {
        console.error('Error loading leaderboard:', err);
      },
    });
  }

  navigateToAddMember(): void {
    this.router.navigate(['/user/members/add']);
  }

  // FIXED: Handle potentially undefined member.id
  navigateToMemberDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/user/members/details', id]);
    }
  }

  // FIXED: Handle potentially undefined member.id
  deleteMember(id: string | undefined, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    if (!id) return;

    if (confirm('Are you sure you want to delete this member?')) {
      this.memberService.deleteMember(id).subscribe({
        next: () => {
          // Remove member from the list
          this.members = this.members.filter((member) => member.id !== id);
          // Update top members for leaderboard
          this.topMembers = this.topMembers.filter(
            (member) => member.id !== id
          );
        },
        error: (err) => {
          console.error('Error deleting member:', err);
          alert('Failed to delete member. Please try again.');
        },
      });
    }
  }

  // FIXED: Handle potentially undefined member.id
  editMember(id: string | undefined, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    if (!id) return;

    // Navigate to edit member page
    this.router.navigate([`/user/members/edit/${id}`]);
  }

  toggleLeaderboard(): void {
    this.showLeaderboard = !this.showLeaderboard;
  }

  navigateToLeaderboard(): void {
    this.router.navigate(['/user/members/leaderboard']);
  }

  // Helper methods for the template
  getTotalScore(): number {
    return this.members.reduce((sum, member) => sum + member.score, 0);
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
