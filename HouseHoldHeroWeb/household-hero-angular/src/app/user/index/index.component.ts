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

  goTo(route: string): void {}

  goToMembers(): void {}

  goToTasksVoting(): void {}

  goToLeaderboard(): void {}

  goToActiveTasks(): void {}

  goToAnalytics(): void {}
}
