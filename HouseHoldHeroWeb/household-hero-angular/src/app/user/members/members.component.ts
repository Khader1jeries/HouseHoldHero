// src/app/user/members/members.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  activeTasks: number;
  score: number;
  profileImage: string;
  trend?: 'up' | 'down' | 'stable';
}

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In a real app, you would fetch this data from a service
    // For now, let's use mock data
    this.members = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+972 55-555-5555',
        age: 23,
        activeTasks: 3,
        score: 1500,
        profileImage: 'assets/profile_pic.png',
        trend: 'up',
      },
      {
        id: '2',
        name: 'Kavin Smith',
        email: 'kavin@example.com',
        phone: '+972 55-444-4444',
        age: 21,
        activeTasks: 5,
        score: 2000,
        profileImage: 'assets/profile_pic.png',
        trend: 'stable',
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+972 55-333-3333',
        age: 27,
        activeTasks: 2,
        score: 1200,
        profileImage: 'assets/profile_pic.png',
        trend: 'down',
      },
    ];

    // Sort members by score for the leaderboard
    this.topMembers = [...this.members].sort((a, b) => b.score - a.score);
  }

  navigateToAddMember(): void {
    this.router.navigate(['/user/members/add']);
  }

  navigateToMemberDetails(id: string): void {
    this.router.navigate(['/user/members/details', id]);
  }

  deleteMember(id: string, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    // In a real app, you would call a service to delete the member
    this.members = this.members.filter((member) => member.id !== id);

    // Update top members for leaderboard
    this.topMembers = [...this.members].sort((a, b) => b.score - a.score);
  }

  editMember(id: string, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

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
    return this.members.filter((member) => member.activeTasks > 0).length;
  }
}
