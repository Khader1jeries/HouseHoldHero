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

  ngOnInit(): void {}

  loadTaskData(): void {}

  getPriorityClass(priority: string): string {
    return '';
  }

  getStatusClass(status: string): string {
    return '';
  }

  addComment(): void {}

  markTaskAsComplete(): void {}

  navigateToEdit(): void {}

  goBack(): void {}
}
