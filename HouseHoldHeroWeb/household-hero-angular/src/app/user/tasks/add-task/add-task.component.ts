// src/app/user/tasks/add-task/add-task.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { MemberService } from '../../../services/member.service';
import { UserService } from '../../../services/user.service';
import { Member } from '../../../services/interfaces/member.interface';
import { Task, SubTask } from '../../../services/interfaces/task.interface';
@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export class AddTaskComponent implements OnInit {
  newTask: Task = {
    createdAt: new Date(),
    description: '',
    dueDate: new Date(),
    startDate: new Date(),
    priority: 'medium',
    title: '',
    adminEmail: '',
    assignedTo: '',
    score: 50,
    status: 'pending',
    subtasks: {},
  };

  familyMembers: Member[] = [];
  assignmentType = 'direct';
  subTasks: { [title: string]: {} } = {};
  newSubTaskTitle: string = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private taskService: TaskService,
    private memberService: MemberService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadFamilyMembers();
  }

  loadFamilyMembers(): void {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('❌ adminEmail not found in session');
      return;
    }

    this.memberService.getMembers(adminEmail).subscribe({
      next: (members) => {
        console.log('✅ Family members loaded:', members);
        this.familyMembers = members; // ✅ Store them here
      },
      error: (err) => {
        console.error('❌ Failed to load family members:', err);
      },
    });
  }

  addSubTask(): void {
    console.log('Adding subtask:', this.newSubTaskTitle);
    const trimmedTitle = this.newSubTaskTitle.trim();

    if (trimmedTitle && !this.subTasks[trimmedTitle]) {
      this.subTasks[trimmedTitle] = {};

      this.newTask['subtasks'] = this.subTasks;
      this.newSubTaskTitle = '';
    }
  }

  removeSubTask(title: string): void {
    delete this.subTasks[title];
    this.newTask['subtasks'] = this.subTasks;
  }
  getSubTaskKeys(): string[] {
    return Object.keys(this.subTasks || {});
  }
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    // Add admin email from session
    const adminEmail = sessionStorage.getItem('adminEmail');
    if (!adminEmail) {
      this.errorMessage = 'Admin email not found. Please log in again.';
      this.isSubmitting = false;
      return;
    }

    this.newTask.adminEmail = adminEmail;

    // If assignment type is 'voting', clear assignedTo
    if (this.assignmentType === 'voting') {
      this.newTask.assignedTo = '';
    }

    // Assign subtasks if not already set
    // Assign subtasks if not already set
    if (Object.keys(this.subTasks).length > 0) {
      this.newTask['subtasks'] = this.subTasks;
    } else {
      delete this.newTask['subtasks'];
    }

    // Call the service to create the task
    this.taskService.createTask(this.newTask).subscribe({
      next: (response) => {
        console.log('✅ Task created:', response);
        this.successMessage = 'Task created successfully!';
        this.isSubmitting = false;
        this.resetForm();
      },
      error: (error) => {
        console.error('❌ Failed to create task:', error);
        this.errorMessage = 'Failed to create task. Please try again.';
        this.isSubmitting = false;
      },
    });
  }
  resetForm(): void {
    this.newTask = {
      createdAt: new Date(),
      description: '',
      dueDate: new Date(),
      startDate: new Date(),
      priority: 'medium',
      title: '',
      adminEmail: '',
      assignedTo: '',
      score: 50,
      status: 'pending',
      subtasks: {},
    };
    this.subTasks = {};
    this.newSubTaskTitle = '';
    this.assignmentType = 'direct';
  }
  cancel(): void {
    this.router.navigate(['/user/tasks']);
  }
}
