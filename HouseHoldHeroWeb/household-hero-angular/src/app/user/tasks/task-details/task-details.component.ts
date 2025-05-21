// src/app/user/tasks/task-details/task-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Task, Comment } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css',
})
export class TaskDetailsComponent implements OnInit {
  taskId: string = '';
  task?: Task;
  subTaskCompletionPercentage: number = 0;
  currentUser: any;

  // New comment functionality
  newComment: string = '';
  isSubmittingComment: boolean = false;
  isCompletingTask: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Get the current user
    this.currentUser = this.userService.getCurrentUser();

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
    this.errorMessage = '';

    this.taskService.getTaskById(this.taskId).subscribe({
      next: (data) => {
        this.task = data;

        // Calculate subtask completion percentage
        if (this.task.subTasks && this.task.subTasks.length > 0) {
          const completedSubTasks = this.task.subTasks.filter(
            (st) => st.completed
          ).length;
          this.subTaskCompletionPercentage =
            (completedSubTasks / this.task.subTasks.length) * 100;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.errorMessage = 'Failed to load task. Please try again.';
        this.isLoading = false;
      },
    });
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

  // Add comment functionality
  addComment(): void {
    if (!this.task || !this.newComment.trim() || !this.currentUser) return;

    this.isSubmittingComment = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create a new comment
    const newComment: Comment = {
      id: Date.now().toString(), // Simple unique ID
      author:
        this.currentUser.fullName ||
        `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      authorImage: 'assets/profile_pic.png', // Update with actual user image if available
      content: this.newComment.trim(),
      timestamp: new Date(),
    };

    this.taskService.addComment(this.taskId, newComment).subscribe({
      next: (response) => {
        this.isSubmittingComment = false;

        // Add the comment to the task
        if (!this.task!.comments) {
          this.task!.comments = [];
        }

        this.task!.comments.push(newComment);

        // Clear the input
        this.newComment = '';

        this.successMessage = 'Comment added successfully';

        // Clear success message after a few seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.isSubmittingComment = false;
        this.errorMessage =
          err.error?.error || 'Failed to add comment. Please try again.';
        console.error('Error adding comment:', err);
      },
    });
  }

  markTaskAsComplete(): void {
    if (!this.task) return;

    this.isCompletingTask = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.taskService.markTaskAsComplete(this.taskId).subscribe({
      next: (updatedTask) => {
        // Update the task with the completed info
        this.task = {
          ...this.task!,
          ...updatedTask,
          status: 'completed',
          completionDate: new Date(),
        };

        this.isCompletingTask = false;
        this.successMessage = 'Task marked as complete';

        // Navigate back to tasks list after a delay
        setTimeout(() => {
          this.router.navigate(['/user/tasks']);
        }, 2000);
      },
      error: (err) => {
        this.isCompletingTask = false;
        this.errorMessage =
          err.error?.error || 'Failed to complete task. Please try again.';
        console.error('Error completing task:', err);
      },
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/user/tasks/edit', this.taskId]);
  }

  goBack(): void {
    this.router.navigate(['/user/tasks']);
  }
}
