// src/app/user/tasks/edit-task/edit-task.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Task, SubTask } from '../../../services/task.service';
import { MemberService } from '../../../services/member.service';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-task.component.html',
  styleUrl: './edit-task.component.css',
})
export class EditTaskComponent implements OnInit {
  taskId: string = '';
  originalTask?: Task;
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
    createdBy: '',
    createdDate: new Date(),
  };

  // Family members for dropdown
  familyMembers: { id: string; name: string }[] = [];

  // Categories - can be expanded
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
  isLoading: boolean = true;

  // Date formatting for the input fields
  dueDateStr: string = '';
  startDateStr: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private memberService: MemberService
  ) {}

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
    this.isLoading = true;

    // Load the task data
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (data) => {
        this.originalTask = { ...data };
        this.task = { ...data };

        // Format dates for the input fields
        this.dueDateStr = this.formatDateForInput(this.task.dueDate);
        if (this.task.startDate) {
          this.startDateStr = this.formatDateForInput(this.task.startDate);
        }

        // Load family members for the dropdown
        this.loadFamilyMembers();
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.errorMessage = 'Failed to load task. Please try again.';
        this.isLoading = false;
      },
    });
  }

  loadFamilyMembers(): void {
    // Use the familyId from the task
    if (!this.task.familyId) {
      this.isLoading = false;
      return;
    }

    this.memberService.getMembers(this.task.familyId).subscribe({
      next: (members) => {
        this.familyMembers = members.map((member) => ({
          id: member.id || '',
          name:
            member.fullName ||
            member.name ||
            `${member.firstName} ${member.lastName}` ||
            'Unknown',
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading family members:', err);
        this.isLoading = false;
      },
    });
  }

  // Format date to YYYY-MM-DD for date inputs
  formatDateForInput(date: Date): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
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
      id: `${this.taskId}-${Date.now()}`, // Generate a unique ID
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

    // Don't need to send the entire task, just the changes
    const updatedTask: Partial<Task> = { ...this.task };

    this.taskService.updateTask(this.taskId, updatedTask).subscribe({
      next: (response) => {
        this.successMessage = 'Task updated successfully';
        this.isSubmitting = false;

        // Navigate back to task details after a delay
        setTimeout(() => {
          this.router.navigate(['/user/tasks/details', this.taskId]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.errorMessage =
          err.error?.error || 'Failed to update task. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/user/tasks/details', this.taskId]);
  }
}
