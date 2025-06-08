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

  ngOnInit(): void {}

  loadLeaderboardData(): void {}

  useMockLeaderboardData(): void {}

  changePeriod(period: 'week' | 'month' | 'year'): void {}
}
