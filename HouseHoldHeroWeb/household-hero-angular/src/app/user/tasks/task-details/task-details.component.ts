// src/app/user/tasks/task-details/task-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Comment {
  id: string;
  author: string;
  authorImage: string;
  content: string;
  timestamp: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assigneeImage: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'upcoming' | 'voting';
  points: number;
  remainingTime?: string;
  completionDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  subTasks?: SubTask[];
  comments?: Comment[];
  createdBy: string;
  createdDate: Date;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css',
})
export class TaskDetailsComponent implements OnInit {
  taskId: string = '';
  task?: Task;
  subTaskCompletionPercentage: number = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Get the task ID from the route parameters
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.taskId = params['id'];
        this.loadTaskData();
      }
    });
  }

  loadTaskData(): void {
    // In a real app, this would call a service to get the data
    // For now, we'll use mock data
    const mockTasks: { [key: string]: Task } = {
      '1': {
        id: '1',
        title: 'Clean Bathroom',
        description:
          'Clean the entire bathroom, including shower, toilet, and sink. Make sure to use appropriate cleaning products for each surface.',
        assignedTo: 'John',
        assigneeImage: 'assets/profile_pic.png',
        dueDate: new Date(2025, 4, 30),
        status: 'pending',
        points: 50,
        remainingTime: '0h 5m 20s',
        priority: 'medium',
        category: 'Cleaning',
        createdBy: 'Admin',
        createdDate: new Date(2025, 4, 25),
        subTasks: [
          { id: '1-1', title: 'Clean shower', completed: true },
          { id: '1-2', title: 'Clean toilet', completed: false },
          { id: '1-3', title: 'Clean sink', completed: false },
          { id: '1-4', title: 'Mop floor', completed: true },
        ],
        comments: [
          {
            id: '1',
            author: 'Admin',
            authorImage: 'assets/profile_pic.png',
            content: 'Please use the new cleaning products under the sink.',
            timestamp: new Date(2025, 4, 26, 9, 30),
          },
          {
            id: '2',
            author: 'John',
            authorImage: 'assets/profile_pic.png',
            content: 'I will complete this task tonight.',
            timestamp: new Date(2025, 4, 27, 14, 15),
          },
        ],
      },
      '2': {
        id: '2',
        title: 'Wash the Car',
        description:
          'Wash the family car, including interior vacuuming. Use the car wash kit in the garage.',
        assignedTo: 'Sarah',
        assigneeImage: 'assets/profile_pic.png',
        dueDate: new Date(2025, 4, 29),
        status: 'pending',
        points: 75,
        remainingTime: '1h 5m 20s',
        priority: 'high',
        category: 'Outdoors',
        createdBy: 'Admin',
        createdDate: new Date(2025, 4, 24),
        subTasks: [
          { id: '2-1', title: 'Wash exterior', completed: false },
          { id: '2-2', title: 'Clean windows', completed: false },
          { id: '2-3', title: 'Vacuum interior', completed: false },
        ],
        comments: [],
      },
      '4': {
        id: '4',
        title: 'Do Laundry',
        description:
          'Wash, dry, and fold all household laundry. Remember to separate colors from whites.',
        assignedTo: 'John',
        assigneeImage: 'assets/profile_pic.png',
        dueDate: new Date(2025, 5, 10),
        status: 'upcoming',
        points: 60,
        priority: 'low',
        category: 'Cleaning',
        createdBy: 'Admin',
        createdDate: new Date(2025, 4, 20),
        subTasks: [
          { id: '4-1', title: 'Sort clothes', completed: false },
          { id: '4-2', title: 'Wash clothes', completed: false },
          { id: '4-3', title: 'Dry clothes', completed: false },
          { id: '4-4', title: 'Fold and put away', completed: false },
        ],
        comments: [],
      },
    };

    this.task = mockTasks[this.taskId];

    if (this.task && this.task.subTasks && this.task.subTasks.length > 0) {
      // Calculate sub-task completion percentage
      const completedSubTasks = this.task.subTasks.filter(
        (st) => st.completed
      ).length;
      this.subTaskCompletionPercentage =
        (completedSubTasks / this.task.subTasks.length) * 100;
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'upcoming':
        return 'status-upcoming';
      case 'voting':
        return 'status-voting';
      default:
        return '';
    }
  }

  markTaskAsComplete(): void {
    if (this.task) {
      this.task.status = 'completed';
      this.task.completionDate = new Date();

      // In a real app, this would call a service to update the task
      console.log('Task marked as complete:', this.task);

      // Navigate back to tasks list after a delay
      setTimeout(() => {
        this.router.navigate(['/user/tasks']);
      }, 2000);
    }
  }

  navigateToEdit(): void {
    this.router.navigate(['/user/tasks/edit', this.taskId]);
  }

  goBack(): void {
    this.router.navigate(['/user/tasks']);
  }
}
