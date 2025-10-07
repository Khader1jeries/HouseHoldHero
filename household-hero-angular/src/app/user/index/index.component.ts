import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MemberService } from '../../services/member.service';
import { VotesService } from '../../services/votes.service';
import { TaskService } from '../../services/task.service';
import { Member } from '../../services/interfaces/member.interface';
import { Task } from '../../services/interfaces/task.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  standalone: true,
  imports: [CommonModule],
})
export class IndexComponent implements OnInit {
  twoMembers: Member[] = [];
  twoVotes: Task[] = [];
  twoActiveTasks: Task[] = [];
  leaderboardData: Member[] = [];
  currentDateTime: string = '';
  constructor(
    private router: Router,

    private memberService: MemberService,
    private votesService: VotesService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.updateDateTime();
    this.loadData();
  }

  loadData(): void {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('❌ Missing admin email in session storage.');
      return;
    }

    this.memberService.getTwoMembers(adminEmail).subscribe({
      next: (members) => {
        this.twoMembers = members;
      },
      error: (err) => {
        console.error('❌ Error fetching members:', err);
      },
    });

    this.votesService.getTwoVotes(adminEmail).subscribe({
      next: (votes) => {
        this.twoVotes = votes;
      },
      error: (err) => {
        console.error('❌ Error fetching vote tasks:', err);
      },
    });

    this.taskService.getTwoActiveTasks(adminEmail).subscribe({
      next: (tasks) => {
        this.twoActiveTasks = tasks;
      },
      error: (err) => {
        console.error('❌ Error fetching active tasks:', err);
      },
    });
    this.memberService.getLeaderboard(adminEmail).subscribe({
      next: (tasks) => {
        this.leaderboardData = tasks;
      },
      error: (err) => {
        console.error('❌ Error fetching active tasks:', err);
      },
    });
  }
  getDuration(startDate: any, endDate: any): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.max(0, end.getTime() - start.getTime());

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  goToMembers(): void {
    this.router.navigate(['/user/members']);
  }

  goToTasksVoting(): void {
    this.router.navigate(['/user/tasks/voting']);
  }

  goToLeaderboard(): void {
    this.router.navigate(['/user/members/leaderboard']);
  }

  goToActiveTasks(): void {
    this.router.navigate(['/user/tasks/active']);
  }

  updateDateTime(): void {
    const now = new Date();

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short', // e.g. Mon
      day: '2-digit', // e.g. 22
      month: 'short', // e.g. Jul
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    this.currentDateTime = now.toLocaleString('en-US', options);
  }
}
