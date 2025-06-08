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
  weekPerformance: PerformanceData[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {}

  loadMemberData(): void {}

  loadPerformanceData(): void {}

  initializeWeeklyStats(): void {}

  showWeekDetails(weekIndex: number): void {}

  navigateToEdit(): void {}

  goBack(): void {}
}
