// src/app/user/tasks/edit-task/edit-task.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  startDate?: Date;
  status: 'pending' | 'completed' | 'upcoming' | 'voting';
  points: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  subTasks?: SubTask[];
}

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-task.component.html',
  styleUrl: './edit-task.component.css',
})
export class EditTaskComponent implements OnInit {
  taskId: string = '';
  task: Task = {
    id: '',
    title: '',
    description: '',
    assignedTo: '',
    dueDate: new Date(),
    status: 'pending',
    points: 50,
    priority: 'medium',
    category: 'General',
  };

  familyMembers: string[] = ['John', 'Kavin', 'Sarah', 'Emma'];
  categories: string[] = [
    'Cleaning',
    'Cooking',
    'Outdoors',
    'Shopping',
    'Maintenance',
    'General',
  ];

  // For adding new subtasks
  newSubTaskTitle: string = '';

  // Form status
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Date formatting for the input fields
  dueDateStr: string = '';
  startDateStr: string = '';

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
        dueDate: new Date(2025, 4, 30),
        status: 'pending',
        points: 50,
        priority: 'medium',
        category: 'Cleaning',
        subTasks: [
          { id: '1-1', title: 'Clean shower', completed: true },
          { id: '1-2', title: 'Clean toilet', completed: false },
          { id: '1-3', title: 'Clean sink', completed: false },
          { id: '1-4', title: 'Mop floor', completed: true },
        ],
      },
      '2': {
        id: '2',
        title: 'Wash the Car',
        description:
          'Wash the family car, including interior vacuuming. Use the car wash kit in the garage.',
        assignedTo: 'Sarah',
        dueDate: new Date(2025, 4, 29),
        status: 'pending',
        points: 75,
        priority: 'high',
        category: 'Outdoors',
      },
      '4': {
        id: '4',
        title: 'Do Laundry',
        description:
          'Wash, dry, and fold all household laundry. Remember to separate colors from whites.',
        assignedTo: 'John',
        startDate: new Date(2025, 5, 5),
        dueDate: new Date(2025, 5, 10),
        status: 'upcoming',
        points: 60,
        priority: 'low',
        category: 'Cleaning',
        subTasks: [
          { id: '4-1', title: 'Sort clothes', completed: false },
          { id: '4-2', title: 'Wash clothes', completed: false },
          { id: '4-3', title: 'Dry clothes', completed: false },
          { id: '4-4', title: 'Fold and put away', completed: false },
        ],
      },
    };

    if (mockTasks[this.taskId]) {
      this.task = { ...mockTasks[this.taskId] };

      // Format dates for the input fields
      this.dueDateStr = this.formatDateForInput(this.task.dueDate);
      if (this.task.startDate) {
        this.startDateStr = this.formatDateForInput(this.task.startDate);
      }
    }
  }

  // Format date to YYYY-MM-DD for date inputs
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Update date values when input changes
  onDueDateChange(event: any): void {
    const value = event.target.value;
    if (value) {
      this.task.dueDate = new Date(value);
    }
  }

  onStartDateChange(event: any): void {
    const value = event.target.value;
    if (value) {
      if (!this.task.startDate) {
        this.task.startDate = new Date();
      }
      this.task.startDate = new Date(value);
    } else {
      this.task.startDate = undefined;
    }
  }

  // Add a new subtask
  addSubTask(): void {
    if (!this.newSubTaskTitle.trim()) return;

    if (!this.task.subTasks) {
      this.task.subTasks = [];
    }

    const newSubTask: SubTask = {
      id: `${this.taskId}-${this.task.subTasks.length + 1}`,
      title: this.newSubTaskTitle.trim(),
      completed: false,
    };

    this.task.subTasks.push(newSubTask);
    this.newSubTaskTitle = '';
  }

  // Remove a subtask
  removeSubTask(index: number): void {
    if (this.task.subTasks) {
      this.task.subTasks.splice(index, 1);
    }
  }

  // Toggle subtask completion
  toggleSubTask(index: number): void {
    if (this.task.subTasks) {
      this.task.subTasks[index].completed =
        !this.task.subTasks[index].completed;
    }
  }

  // Save task changes
  saveTask(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (!this.task.title.trim()) {
      this.errorMessage = 'Task title is required';
      this.isSubmitting = false;
      return;
    }

    // In a real app, this would call a service to save the data
    setTimeout(() => {
      console.log('Saving task:', this.task);
      this.successMessage = 'Task updated successfully';
      this.isSubmitting = false;

      // Navigate back to task details after a delay
      setTimeout(() => {
        this.router.navigate(['/user/tasks', this.taskId]);
      }, 2000);
    }, 1500);
  }

  cancel(): void {
    this.router.navigate(['/user/tasks', this.taskId]);
  }
}
