// src/app/user/tasks/task-details/task-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Comment } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';
import { Task } from '../../../services/interfaces/task.interface';
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
    this.loadTaskData();
  }

  loadTaskData(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.taskId) {
      this.errorMessage = 'Task ID not found in URL.';
      this.isLoading = false;
      return;
    }

    this.taskService.getTaskById(this.taskId).subscribe({
      next: (taskData) => {
        this.task = taskData;
        this.isLoading = false;

        // Calculate sub-task completion percentage
        if (
          this.task['subtasks'] &&
          Object.keys(this.task['subtasks']).length > 0
        ) {
          const subtasks = this.task['subtasks'];
          const total = Object.keys(subtasks).length;
          const completed = Object.values(subtasks).filter(
            (st: any) => st.status === true
          ).length;
          this.subTaskCompletionPercentage = Math.round(
            (completed / total) * 100
          );
        } else {
          this.subTaskCompletionPercentage = 0;
        }

        console.log('✅ Task loaded:', this.task);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load task.';
        console.error('❌ Task loading error:', error);
        this.isLoading = false;
      },
    });
  }

  getPriorityClass(priority: string): string {
    return '';
  }

  getStatusClass(status: string): string {
    return '';
  }

  addComment(): void {}

  goBack(): void {
    this.router.navigate(['/user/tasks']);
  }
}
