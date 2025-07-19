import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../../services/member.service';
import { UserService } from '../../../services/user.service';

interface LeaderboardMember {
  id: string;
  name: string;
  position: number;
  score: number;
  profileImage: string;
  tasks: number;
  completionRate: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
})
export class LeaderboardComponent implements OnInit {
  selectedPeriod: 'week' | 'month' | 'year' = 'month';
  leaderboardData: LeaderboardMember[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  familyId: string | null = null;

  constructor(
    private memberService: MemberService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadLeaderboardData();
  }
  loadLeaderboardData(): void {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('❌ adminEmail not found in session');
      this.error = 'Missing admin session. Please log in again.';
      this.isLoading = false;
      return;
    }

    this.memberService.getLeaderboard(adminEmail).subscribe({
      next: (data) => {
        // Optional: transform to LeaderboardMember[] if needed
        this.leaderboardData = data.map((member, index) => ({
          id: member.email,
          name: `${member.firstName} ${member.lastName}`,
          position: index + 1,
          score: member.score || 0,
          profileImage: 'assets/profile_pic.png', // Default image, replace if dynamic
          tasks: member.completedTasks || 0,
          completionRate: member.completionRate || 0,
        }));

        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching leaderboard:', err);
        this.error = 'Failed to load leaderboard.';
        this.isLoading = false;
      },
    });
  }

  changePeriod(period: 'week' | 'month' | 'year'): void {}
}
