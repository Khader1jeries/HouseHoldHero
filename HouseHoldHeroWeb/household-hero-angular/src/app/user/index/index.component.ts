// src/app/user/index/index.component.ts - Updated to preserve family ID in navigation
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  standalone: true,
})
export class IndexComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  goTo(route: string) {
    // Use the UserService to navigate with family ID preserved
    this.userService.navigateWithFamilyId([route]);
  }

  // Navigation methods that preserve family ID
  goToMembers() {
    this.userService.navigateWithFamilyId(['/user/members']);
  }

  goToTasksVoting() {
    this.userService.navigateWithFamilyId(['/user/tasks'], { tab: 'voting' });
  }

  goToLeaderboard() {
    this.userService.navigateWithFamilyId(['/user/members'], {
      view: 'leaderboard',
    });
  }

  goToActiveTasks() {
    this.userService.navigateWithFamilyId(['/user/tasks'], { tab: 'active' });
  }

  // New method for Analytics navigation
  goToAnalytics() {
    this.userService.navigateWithFamilyId(['/user/analytics']);
  }
}
