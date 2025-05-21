// src/app/user/tasks/tasks.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService, Task } from '../../services/task.service';
import { MemberService } from '../../services/member.service';
import { UserService } from '../../services/user.service';
import { interval, Subscription } from 'rxjs';

// Extended Task interface with additional properties
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

  // For updating remaining time
  private timerSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private memberService: MemberService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Get the user's family ID
    const user = this.userService.getCurrentUser();
    if (user && user.familyId) {
      this.familyId = user.familyId;
    }

    // Check for tab parameter from the route
    this.route.queryParams.subscribe((params) => {
      if (
        params['tab'] &&
        (params['tab'] === 'active' ||
          params['tab'] === 'finished' ||
          params['tab'] === 'future' ||
          params['tab'] === 'voting')
      ) {
        this.activeTab = params['tab'] as
          | 'active'
          | 'finished'
          | 'future'
          | 'voting';
      }
    });

    // Load tasks
    this.loadTasks();

    // Set up timer to update remaining time every minute
    this.timerSubscription = interval(60000).subscribe(() => {
      this.updateRemainingTimes();
    });
  }

  ngOnDestroy(): void {
    // Clean up timer subscription when component is destroyed
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadTasks(): void {
    this.isLoading = true;
    this.error = null;

    this.taskService.getTasks(undefined, this.familyId || undefined).subscribe({
      next: (data) => {
        this.tasks = data.map((task) => {
          // Ensure dates are properly formatted as Date objects
          const formattedTask = { ...task };

          // Convert date objects if they're not already
          if (
            formattedTask.dueDate &&
            !(formattedTask.dueDate instanceof Date)
          ) {
            formattedTask.dueDate = new Date(formattedTask.dueDate);
          }

          if (
            formattedTask.startDate &&
            !(formattedTask.startDate instanceof Date)
          ) {
            formattedTask.startDate = new Date(formattedTask.startDate);
          }

          if (
            formattedTask.completionDate &&
            !(formattedTask.completionDate instanceof Date)
          ) {
            formattedTask.completionDate = new Date(
              formattedTask.completionDate
            );
          }

          // Add computed properties
          return {
            ...formattedTask,
            completedOnTime:
              formattedTask.completedOnTime !== undefined
                ? formattedTask.completedOnTime
                : formattedTask.completionDate && formattedTask.dueDate
                ? new Date(formattedTask.completionDate) <=
                  new Date(formattedTask.dueDate)
                : true,
            timeUntilStart: formattedTask.startDate
              ? this.calculateTimeUntilStart(formattedTask.startDate)
              : undefined,
          };
        });

        this.enrichTasksWithMemberData();
        this.updateRemainingTimes();
        this.filterTasks();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.error = 'Failed to load tasks. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  // Calculate time until task starts
  calculateTimeUntilStart(startDate: Date | string): string {
    const now = new Date();
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Starting now';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  }

  // Enrich tasks with member data (like assignee image)
  enrichTasksWithMemberData(): void {
    // Get all members
    this.memberService.getMembers(this.familyId || undefined).subscribe({
      next: (members) => {
        // Create a map of member IDs to member data for quick lookup
        const memberMap = new Map(members.map((member) => [member.id, member]));

        // Update each task with the assignee's data
        this.tasks = this.tasks.map((task) => {
          if (task.assignedTo && memberMap.has(task.assignedTo)) {
            const member = memberMap.get(task.assignedTo);
            return {
              ...task,
              assigneeImage: member?.profileImage || 'assets/profile_pic.png',
              assigneeName: member?.fullName || member?.name || 'Unknown',
            };
          }
          return task;
        });

        // Re-filter tasks after enrichment
        this.filterTasks();
      },
      error: (err) => {
        console.error('Error loading members for task enrichment:', err);
      },
    });
  }

  // Update remaining time for active tasks
  updateRemainingTimes(): void {
    this.tasks = this.tasks.map((task) => {
      if (task.status === 'pending' && task.dueDate) {
        return {
          ...task,
          remainingTime: this.taskService.calculateRemainingTime(task.dueDate),
        };
      }
      return task;
    });

    // Re-filter tasks after updating times
    this.filterTasks();
  }

  filterTasks(): void {
    this.activeTasks = this.tasks.filter((task) => task.status === 'pending');
    this.finishedTasks = this.tasks.filter(
      (task) => task.status === 'completed'
    );
    this.futureTasks = this.tasks.filter((task) => task.status === 'upcoming');
    this.tasksUnderVoting = this.tasks.filter(
      (task) => task.status === 'voting'
    );
  }

  changeTab(tab: 'active' | 'finished' | 'future' | 'voting'): void {
    this.activeTab = tab;
    // Update the URL to reflect the current tab without reloading
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
  }

  navigateToAddTask(): void {
    this.router.navigate(['/user/tasks/add']);
  }

  navigateToTaskDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/user/tasks/details', id]);
    }
  }

  markTaskAsComplete(id: string | undefined, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    if (!id) return;

    this.taskService.markTaskAsComplete(id).subscribe({
      next: (updatedTask) => {
        // Find the task in our array and update it
        const taskIndex = this.tasks.findIndex((t) => t.id === id);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            ...updatedTask,
            status: 'completed',
            completionDate: new Date(),
          };
          this.filterTasks();
        }
      },
      error: (err) => {
        console.error('Error marking task as complete:', err);
        alert('Failed to complete task. Please try again.');
      },
    });
  }

  deleteTask(id: string | undefined, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    if (!id) return;

    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          // Remove task from our arrays
          this.tasks = this.tasks.filter((task) => task.id !== id);
          this.filterTasks();
        },
        error: (err) => {
          console.error('Error deleting task:', err);
          alert('Failed to delete task. Please try again.');
        },
      });
    }
  }

  viewVotes(taskId: string | undefined, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    if (!taskId) return;

    // Navigate to votes page
    this.router.navigate(['/user/tasks/votes', taskId]);
  }

  editTask(taskId: string | undefined, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    if (!taskId) return;

    // Navigate to edit task page
    this.router.navigate(['/user/tasks/edit', taskId]);
  }
}
