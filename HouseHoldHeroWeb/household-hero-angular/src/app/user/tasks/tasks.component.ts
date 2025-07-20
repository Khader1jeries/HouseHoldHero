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

  loadTasks(): void {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('❌ Admin email not found in session storage.');
      return;
    }

    this.taskService.getTasks(adminEmail).subscribe({
      next: (tasks) => {
        console.log('✅ Tasks loaded:', tasks);
        // Save to a local variable (you must declare it first)
        this.tasks = tasks;
      },
      error: (err) => {
        console.error('❌ Failed to load tasks:', err);
      },
    });
  }

  changeTab(tab: 'active' | 'finished' | 'future' | 'voting'): void {
    this.activeTab = tab;

    const now = new Date().getTime();

    this.activeTasks = [];
    this.finishedTasks = [];
    this.futureTasks = [];

    for (const task of this.tasks) {
      const start = new Date(task.startDate).getTime();
      const due = new Date(task.dueDate).getTime();

      if (due < now) {
        this.finishedTasks.push(task); // Task is past due date
      } else if (start > now) {
        this.futureTasks.push(task); // Task is scheduled for future
      } else {
        this.activeTasks.push(task); // Task is ongoing now
      }
    }
  }

  navigateToAddTask(): void {
    this.router.navigate(['/user/tasks/add']);
  }

  navigateToTaskDetails(id: string | undefined): void {
    if (!id) {
      console.error('❌ Task ID is undefined, cannot navigate to details.');
      return;
    }

    this.router.navigate(['/user/tasks/details', id]);
  }

  deleteTask(id: string | undefined, event: Event): void {
    event.stopPropagation(); // prevent triggering parent click handlers (e.g., row selection)

    if (!id) {
      console.error('❌ Task ID is undefined');
      return;
    }

    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(id).subscribe({
      next: (res) => {
        console.log('✅ Task deleted:', res);
        this.loadTasks(); // Refresh task list after deletion
      },
      error: (err) => {
        console.error('❌ Failed to delete task:', err);
      },
    });
  }

  viewVotes(taskId: string | undefined, event: Event): void {}
  calculateTimeUntilStart(startDate: Date | string): string {
    return '';
  }

  enrichTasksWithMemberData(): void {}

  updateRemainingTimes(): void {}

  filterTasks(): void {}
}
