// src/app/user/tasks/tasks.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { MemberService } from '../../services/member.service';
import { UserService } from '../../services/user.service';
import { interval, Subscription } from 'rxjs';
import { Task } from '../../services/interfaces/task.interface';

interface ExtendedTask extends Task {
  timeUntilStart?: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks: ExtendedTask[] = [];
  activeTasks: ExtendedTask[] = [];
  finishedTasks: ExtendedTask[] = [];
  futureTasks: ExtendedTask[] = [];
  tasksUnderVoting: ExtendedTask[] = [];

  activeTab: 'active' | 'finished' | 'future' | 'voting' = 'active';
  isLoading: boolean = true;
  error: string | null = null;
  familyId: string | null = null;

  private timerSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private memberService: MemberService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadTasks(): void {}

  calculateTimeUntilStart(startDate: Date | string): string {
    return '';
  }

  enrichTasksWithMemberData(): void {}

  updateRemainingTimes(): void {}

  filterTasks(): void {}

  changeTab(tab: 'active' | 'finished' | 'future' | 'voting'): void {}

  navigateToAddTask(): void {
    this.router.navigate(['/user/tasks/add']);
  }

  navigateToTaskDetails(id: string | undefined): void {}

  markTaskAsComplete(id: string | undefined, event: Event): void {}

  deleteTask(id: string | undefined, event: Event): void {}

  viewVotes(taskId: string | undefined, event: Event): void {}

  editTask(taskId: string | undefined, event: Event): void {}
}
