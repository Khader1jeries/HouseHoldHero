// src/app/user/tasks/tasks.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  startDate?: Date; // Added for future tasks
  status: 'pending' | 'completed' | 'upcoming' | 'voting';
  points: number;
  remainingTime?: string;
  timeUntilStart?: string; // Added for future tasks
  completedOnTime?: boolean; // Added for finished tasks
  completionDate?: Date; // Added for finished tasks
  votesYes?: number; // Added for voting
  votesNo?: number; // Added for voting
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  activeTasks: Task[] = [];
  finishedTasks: Task[] = [];
  futureTasks: Task[] = [];
  tasksUnderVoting: Task[] = [];

  activeTab: 'active' | 'finished' | 'future' | 'voting' = 'active';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // In a real app, tasks would be fetched from a service
    this.tasks = [
      {
        id: '1',
        title: 'Clean Bathroom',
        description:
          'Clean the entire bathroom, including shower, toilet, and sink',
        assignedTo: 'John',
        dueDate: new Date(2025, 4, 30), // May 30, 2025
        status: 'pending',
        points: 50,
        remainingTime: '0h 5m 20s',
      },
      {
        id: '2',
        title: 'Wash the Car',
        description: 'Wash the family car, including interior vacuuming',
        assignedTo: 'Sarah',
        dueDate: new Date(2025, 4, 29), // May 29, 2025
        status: 'pending',
        points: 75,
        remainingTime: '1h 5m 20s',
      },
      {
        id: '3',
        title: 'Take out Trash',
        description: 'Take all trash bags to the dumpster',
        assignedTo: 'Kavin',
        dueDate: new Date(2025, 4, 28), // May 28, 2025
        status: 'completed',
        points: 20,
        completedOnTime: true,
        completionDate: new Date(2025, 4, 27), // May 27, 2025
      },
      {
        id: '4',
        title: 'Do Laundry',
        description: 'Wash, dry, and fold all household laundry',
        assignedTo: 'John',
        startDate: new Date(2025, 5, 5), // June 5, 2025
        dueDate: new Date(2025, 5, 10), // June 10, 2025
        status: 'upcoming',
        points: 60,
        timeUntilStart: '3d 5h 22m',
      },
      {
        id: '5',
        title: 'Cook Family Dinner',
        description: 'Prepare dinner for the whole family',
        assignedTo: '',
        dueDate: new Date(2025, 4, 30), // May 30, 2025
        status: 'voting',
        points: 100,
        votesYes: 3,
        votesNo: 2,
      },
      {
        id: '6',
        title: 'Clean Windows',
        description: 'Clean all windows in the house',
        assignedTo: '',
        dueDate: new Date(2025, 5, 5), // June 5, 2025
        status: 'voting',
        points: 80,
        votesYes: 1,
        votesNo: 4,
      },
      {
        id: '7',
        title: 'Mow the Lawn',
        description: 'Mow the front and back lawn',
        assignedTo: 'Sarah',
        dueDate: new Date(2025, 4, 26), // May 26, 2025
        status: 'completed',
        points: 40,
        completedOnTime: false,
        completionDate: new Date(2025, 4, 27), // May 27, 2025 (one day late)
      },
    ];

    // Filter tasks by status
    this.filterTasks();

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

  navigateToTaskDetails(id: string): void {
    this.router.navigate(['/user/tasks/details', id]);
  }

  markTaskAsComplete(id: string, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    // In a real app, this would call a service
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].status = 'completed';
      this.tasks[taskIndex].completionDate = new Date();
      // Determine if task was completed on time
      this.tasks[taskIndex].completedOnTime =
        this.tasks[taskIndex].completionDate <= this.tasks[taskIndex].dueDate;
      this.filterTasks();
    }
  }

  deleteTask(id: string, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    // In a real app, this would call a service
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.filterTasks();
  }

  viewVotes(taskId: string, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    // Navigate to votes page
    this.router.navigate(['/user/tasks/votes', taskId]);
  }

  editTask(taskId: string, event: Event): void {
    // Stop event propagation to prevent navigation
    event.stopPropagation();

    // In a real app, this would navigate to the edit task page
    this.router.navigate(['/user/tasks/edit', taskId]);
  }
}
