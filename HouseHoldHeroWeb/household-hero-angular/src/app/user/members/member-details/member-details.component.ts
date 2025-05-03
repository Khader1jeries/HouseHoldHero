// src/app/user/members/member-details/member-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  role: string;
  profileImage: string;
  activeTasks: number;
  score: number;
  tasks: Task[];
  completionRate: number;
  joinDate: Date;
  lastActive: Date;
}

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  points: number;
}

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.css',
})
export class MemberDetailsComponent implements OnInit {
  memberId: string = '';
  member?: Member;
  activeTasksCount: number = 0;
  completedTasksCount: number = 0;
  overdueTasksCount: number = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Get the member ID from the route parameters
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.memberId = params['id'];
        this.loadMemberData();
      }
    });
  }

  loadMemberData(): void {
    // In a real app, this would call a service to get the data
    // For now, we'll use mock data
    const mockMembers: { [key: string]: Member } = {
      '1': {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+972 55-555-5555',
        age: 23,
        role: 'Family Member',
        profileImage: 'assets/profile_pic.png',
        activeTasks: 3,
        score: 1500,
        completionRate: 85,
        joinDate: new Date(2024, 0, 15),
        lastActive: new Date(),
        tasks: [
          {
            id: '1',
            title: 'Clean Bathroom',
            dueDate: new Date(2025, 4, 30),
            status: 'pending',
            points: 50,
          },
          {
            id: '2',
            title: 'Take out Trash',
            dueDate: new Date(2025, 4, 28),
            status: 'completed',
            points: 20,
          },
          {
            id: '3',
            title: 'Do Laundry',
            dueDate: new Date(2025, 4, 25),
            status: 'overdue',
            points: 60,
          },
        ],
      },
      '2': {
        id: '2',
        name: 'Kavin Smith',
        email: 'kavin@example.com',
        phone: '+972 55-444-4444',
        age: 21,
        role: 'Family Member',
        profileImage: 'assets/profile_pic.png',
        activeTasks: 5,
        score: 2000,
        completionRate: 95,
        joinDate: new Date(2024, 0, 10),
        lastActive: new Date(),
        tasks: [
          {
            id: '4',
            title: 'Wash the Car',
            dueDate: new Date(2025, 4, 29),
            status: 'pending',
            points: 75,
          },
          {
            id: '5',
            title: 'Mow the Lawn',
            dueDate: new Date(2025, 4, 26),
            status: 'completed',
            points: 40,
          },
        ],
      },
      '3': {
        id: '3',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+972 55-333-3333',
        age: 27,
        role: 'Family Member',
        profileImage: 'assets/profile_pic.png',
        activeTasks: 2,
        score: 1800,
        completionRate: 90,
        joinDate: new Date(2024, 0, 5),
        lastActive: new Date(),
        tasks: [
          {
            id: '6',
            title: 'Grocery Shopping',
            dueDate: new Date(2025, 4, 29),
            status: 'pending',
            points: 30,
          },
          {
            id: '7',
            title: 'Cook Dinner',
            dueDate: new Date(2025, 4, 27),
            status: 'completed',
            points: 50,
          },
        ],
      },
    };

    this.member = mockMembers[this.memberId];

    if (this.member) {
      // Count tasks by status
      this.activeTasksCount = this.member.tasks.filter(
        (t) => t.status === 'pending'
      ).length;
      this.completedTasksCount = this.member.tasks.filter(
        (t) => t.status === 'completed'
      ).length;
      this.overdueTasksCount = this.member.tasks.filter(
        (t) => t.status === 'overdue'
      ).length;
    }
  }

  navigateToEdit(): void {
    this.router.navigate(['/user/members/edit', this.memberId]);
  }

  goBack(): void {
    this.router.navigate(['/user/members']);
  }
}
