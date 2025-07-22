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
  completedTasks: number;
  totalTasks: number;
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
          completedTasks: member.completedTasks || 0,
          totalTasks: member.totalTasks || 0,
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
  getCompletionRate(totalTasks: number, completedTasks: number): number {
    if (totalTasks === 0) {
      return 0; // Avoid division by zero
    }

    const percentage = (completedTasks / totalTasks) * 100;
    return parseFloat(percentage.toFixed(2)); // Keep 2 decimal places
  }
  changePeriod(period: 'week' | 'month' | 'year'): void {}
}
