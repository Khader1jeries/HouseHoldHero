import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../../services/member.service';
import { UserService } from '../../../services/user.service';
import { LoadingComponent } from '../../../loading/loading.component';
import { Observable } from 'rxjs';
import { Member } from '../../../services/interfaces/member.interface';

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
  imports: [CommonModule, LoadingComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
})
export class LeaderboardComponent implements OnInit {
  selectedPeriod: 'month' | 'overall' | 'year' = 'overall';
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

    this.isLoading = true;

    this.memberService.getLeaderboard(adminEmail).subscribe({
      next: (data: Member[]) => {
        this.leaderboardData = data.map((member: any, index: number) => ({
          id: member.email || member.memberId,
          name: member.fullName || '',
          position: index + 1,
          score: member.score || 0,
          profileImage: 'assets/profile_pic.png',
          tasks: member.totalTasks || 0,
          completedTasks: Math.round(
            (member.completionRate || 0) * (member.totalTasks || 0)
          ),
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
  getMonthlyLeaderboard() {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('❌ adminEmail not found in session');
      this.error = 'Missing admin session. Please log in again.';
      this.isLoading = false;
      return;
    }

    this.memberService.getMonthlyLeaderboard(adminEmail).subscribe({
      next: (data) => {
        this.leaderboardData = Object.values(data).map(
          (member: any, index: number) => ({
            id: member.email,
            name: member.fullName || '',
            position: index + 1,
            score: member.score || 0,
            profileImage: 'assets/profile_pic.png',
            tasks: member.totalTasks || 0,
            completedTasks: Math.round(
              (member.completionRate || 0) * (member.totalTasks || 0)
            ),
            totalTasks: member.totalTasks || 0,
          })
        );

        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching leaderboard:', err);
        this.error = 'Failed to load leaderboard.';
        this.isLoading = false;
      },
    });
  }
  getYearlyLeaderboard() {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('❌ adminEmail not found in session');
      this.error = 'Missing admin session. Please log in again.';
      this.isLoading = false;
      return;
    }

    this.memberService.getYearlyLeaderboard(adminEmail).subscribe({
      next: (data) => {
        this.leaderboardData = Object.values(data).map(
          (member: any, index: number) => ({
            id: member.email,
            name: member.fullName || '',
            position: index + 1,
            score: member.score || 0,
            profileImage: 'assets/profile_pic.png',
            tasks: member.totalTasks || 0,
            completedTasks: Math.round(
              (member.completionRate || 0) * (member.totalTasks || 0)
            ),
            totalTasks: member.totalTasks || 0,
          })
        );

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
  changePeriod(period: 'month' | 'overall' | 'year'): void {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('❌ adminEmail not found in session');
      this.error = 'Missing admin session. Please log in again.';
      this.isLoading = false;
      return;
    }
    this.selectedPeriod = period;
    this.isLoading = true;
    let leaderboardObservable: Observable<any[]>;

    switch (period) {
      case 'month':
        // 🔴 You don't have weekly leaderboard implemented yet
        leaderboardObservable =
          this.memberService.getMonthlyLeaderboard(adminEmail);
        break;
      case 'overall':
        leaderboardObservable =
          this.memberService.getMonthlyLeaderboard(adminEmail);
        break;

      case 'year':
        leaderboardObservable =
          this.memberService.getYearlyLeaderboard(adminEmail);
        break;

      default:
        console.error('Invalid period selected');
        this.isLoading = false;
        return;
    }

    // ✅ Subscribe to the selected observable
    leaderboardObservable.subscribe({
      next: (data) => {
        this.leaderboardData = Object.values(data).map(
          (member: any, index: number) => ({
            id: member.email || member.memberId,
            name: member.fullName || '',
            position: index + 1,
            score: member.score || 0,
            profileImage: 'assets/profile_pic.png',
            tasks: member.totalTasks || 0,
            completedTasks: Math.round(
              (member.completionRate || 0) * (member.totalTasks || 0)
            ),
            totalTasks: member.totalTasks || 0,
          })
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading leaderboard:', err);
        this.error = 'Failed to load leaderboard.';
        this.isLoading = false;
      },
    });
  }
}
