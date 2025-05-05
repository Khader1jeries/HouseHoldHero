import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  standalone: true,
})
export class IndexComponent {
  constructor(private router: Router) {}

  goTo(route: string) {
    window.location.href = '/' + route;
    // Or use Angular Router: this.router.navigate([route]);
  }

  // Navigation methods
  goToMembers() {
    this.router.navigate(['/user/members']);
  }

  goToTasksVoting() {
    this.router.navigate(['/user/tasks'], { queryParams: { tab: 'voting' } });
  }

  goToLeaderboard() {
    this.router.navigate(['/user/members'], {
      queryParams: { view: 'leaderboard' },
    });
  }

  goToActiveTasks() {
    this.router.navigate(['/user/tasks'], { queryParams: { tab: 'active' } });
  }

  // New method for Analytics navigation
  goToAnalytics() {
    this.router.navigate(['/user/analytics']);
  }
}
