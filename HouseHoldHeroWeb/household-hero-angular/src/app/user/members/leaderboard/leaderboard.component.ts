// src/app/user/members/leaderboard/leaderboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  constructor() {}

  ngOnInit(): void {
    // Load leaderboard data
    this.loadLeaderboardData();
  }

  loadLeaderboardData(): void {
    // In a real app, this would call a service to get the data
    // For now, we'll use mock data
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
    // In a real app, this would reload the data based on the selected period
    // For demo purposes, we'll just change the title
  }
}
