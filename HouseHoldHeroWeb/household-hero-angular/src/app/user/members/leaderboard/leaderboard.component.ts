// src/app/user/members/leaderboard/leaderboard.component.ts
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
    // Get the user's family ID
    const user = this.userService.getCurrentUser();
    if (user && user.familyId) {
      this.familyId = user.familyId;
      this.loadLeaderboardData();
    } else {
      this.error = 'No family information found. Please log in again.';
      this.isLoading = false;
    }
  }

  loadLeaderboardData(): void {
    if (!this.familyId) {
      this.error = 'No family ID available';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Get leaderboard data from the service
    this.memberService
      .getLeaderboard(this.familyId, this.selectedPeriod)
      .subscribe({
        next: (data) => {
          this.leaderboardData = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading leaderboard data:', err);
          this.error = 'Failed to load leaderboard data. Please try again.';
          this.isLoading = false;

          // Fallback to mock data if API fails
          this.useMockLeaderboardData();
        },
      });
  }

  // Fallback method to use mock data if API fails
  useMockLeaderboardData(): void {
    this.leaderboardData = [
      {
        id: '2',
        name: 'Kavin Smith',
        position: 1,
        score: 2200,
        profileImage: 'assets/profile_pic.png',
        tasks: 22,
        completionRate: 95,
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        position: 2,
        score: 1800,
        profileImage: 'assets/profile_pic.png',
        tasks: 18,
        completionRate: 90,
      },
      {
        id: '1',
        name: 'John Doe',
        position: 3,
        score: 1500,
        profileImage: 'assets/profile_pic.png',
        tasks: 15,
        completionRate: 85,
      },
    ];
  }

  changePeriod(period: 'week' | 'month' | 'year'): void {
    this.selectedPeriod = period;
    // Reload data with the new period
    this.loadLeaderboardData();
  }
}
