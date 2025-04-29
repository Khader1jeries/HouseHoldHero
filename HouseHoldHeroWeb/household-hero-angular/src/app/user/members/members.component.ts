// src/app/user/members/members.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  activeTasks: number;
  score: number;
  profileImage: string;
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
      },
    ];
  }

  navigateToAddMember(): void {
    this.router.navigate(['/user/members/add']);
  }

  deleteMember(id: string): void {
    // In a real app, you would call a service to delete the member
    this.members = this.members.filter((member) => member.id !== id);
  }

  editMember(id: string): void {
    // Navigate to edit member page
    this.router.navigate([`/user/members/edit/${id}`]);
  }
}
