// src/app/user/members/member-details/member-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MemberService,
  PerformanceData,
} from '../../../services/member.service';

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
  member?: any;
  activeTasksCount: number = 0;
  completedTasksCount: number = 0;
  overdueTasksCount: number = 0;

  // Weekly performance data
  weekPerformance: PerformanceData[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService
  ) {}

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
    this.isLoading = true;
    this.error = null;

    // Get the member details
    this.memberService.getMemberById(this.memberId).subscribe({
      next: (data) => {
        this.member = data;

        // Count tasks by status
        if (data.tasks && Array.isArray(data.tasks)) {
          this.activeTasksCount = data.tasks.filter(
            (t: Task) => t.status === 'pending'
          ).length;

          this.completedTasksCount = data.tasks.filter(
            (t: Task) => t.status === 'completed'
          ).length;

          this.overdueTasksCount = data.tasks.filter(
            (t: Task) => t.status === 'overdue'
          ).length;
        } else {
          // If no tasks property or not an array, set counts to 0
          this.activeTasksCount = 0;
          this.completedTasksCount = 0;
          this.overdueTasksCount = 0;
        }

        // Load performance data
        this.loadPerformanceData();
      },
      error: (err) => {
        console.error('Error loading member data:', err);
        this.error = 'Failed to load member data. Please try again.';
        this.isLoading = false;
      },
    });
  }

  // Load performance history data
  loadPerformanceData(): void {
    this.memberService.getMemberPerformance(this.memberId).subscribe({
      next: (data) => {
        this.weekPerformance = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading performance data:', err);
        // Use mock data as fallback
        this.initializeWeeklyStats();
        this.isLoading = false;
      },
    });
  }

  // Initialize mock weekly performance data as fallback
  initializeWeeklyStats(): void {
    this.weekPerformance = [
      { week: 1, tasks: 5, completed: 4, points: 210 },
      { week: 2, tasks: 6, completed: 5, points: 230 },
      { week: 3, tasks: 7, completed: 6, points: 270 },
      { week: 4, tasks: 8, completed: 7, points: 310 },
      { week: 5, tasks: 9, completed: 8, points: 340 },
      { week: 6, tasks: 10, completed: 9, points: 380 },
    ];
  }

  // Show detailed stats for a specific week
  showWeekDetails(weekIndex: number): void {
    if (weekIndex >= 0 && weekIndex < this.weekPerformance.length) {
      const weekData = this.weekPerformance[weekIndex];
      console.log(`Week ${weekData.week} Details:`, weekData);

      // In a real app, you might show a modal or detailed view with this data
      // For now, we're using tooltips in the HTML
    }
  }

  navigateToEdit(): void {
    this.router.navigate(['/user/members/edit', this.memberId]);
  }

  goBack(): void {
    this.router.navigate(['/user/members']);
  }
}
