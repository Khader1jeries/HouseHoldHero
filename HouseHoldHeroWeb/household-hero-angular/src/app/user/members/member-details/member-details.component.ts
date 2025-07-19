import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService } from '../../../services/member.service';

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

  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.loadMemberData();
  }

  loadMemberData(): void {
    const memberEmail = this.route.snapshot.paramMap.get('id');
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!memberEmail || !adminEmail) {
      console.error('❌ Missing memberEmail or adminEmail');
      this.error = 'Missing member or admin information.';
      this.isLoading = false;
      return;
    }

    this.memberService.getMemberByEmail(memberEmail, adminEmail).subscribe({
      next: (memberData) => {
        this.member = memberData;
        this.memberId = memberEmail;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching member data:', err);
        this.error = 'Failed to load member details.';
        this.isLoading = false;
      },
    });
  }

  loadPerformanceData(): void {}

  initializeWeeklyStats(): void {}

  showWeekDetails(weekIndex: number): void {}

  goBack(): void {
    this.router.navigate(['/user/members']);
  }
}
