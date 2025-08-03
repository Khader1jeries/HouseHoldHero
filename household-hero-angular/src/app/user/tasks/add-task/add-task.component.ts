// src/app/user/tasks/add-task/add-task.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { MemberService } from '../../../services/member.service';

import { Member } from '../../../services/interfaces/member.interface';
import { Task } from '../../../services/interfaces/task.interface';
import { VoteTask } from '../../../services/interfaces/votes.interface';
import { VotesService } from '../../../services/votes.service';
@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export class AddTaskComponent implements OnInit {
  newVote: VoteTask = {
    createdAt: new Date(),
    description: '',
    dueDate: new Date(),
    startDate: new Date(),
    priority: 'medium',
    title: '',
    adminEmail: '',
    subtasks: {},
  };
  newTask: Task = {
    assignedToName: '',
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
    private votesService: VotesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Retrieve the duplicate data from query params
    this.route.queryParams.subscribe((params) => {
      if (params['duplicate'] === 'true' && params['taskData']) {
        try {
          const duplicateData = JSON.parse(params['taskData']);

          if (duplicateData) {
            this.newTask.title = duplicateData.title;
            this.newTask.description = duplicateData.description;
            this.newTask.priority = duplicateData.priority;
            this.newTask['subtasks'] = duplicateData.subtasks;

            this.newVote.title = duplicateData.title;
            this.newVote.description = duplicateData.description;
            this.newVote.priority = duplicateData.priority;
            this.newVote['subtasks'] = duplicateData.subtasks;
          }
        } catch (error) {
          console.error('Error parsing task data:', error);
        }
      }

      this.loadFamilyMembers();
    });
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
      this.newVote.adminEmail = this.newTask.adminEmail;
      this.newVote.title = this.newTask.title;
      this.newVote.description = this.newTask.description;
      this.newVote.createdAt = this.newTask.createdAt;
      this.newVote.startDate = this.newTask.startDate;
      this.newVote.dueDate = this.newTask.dueDate;
      this.newVote.priority = this.newTask.priority;
      this.newVote['subtasks'] = this.newTask['subtasks'];
    } else {
      const selectedMember = this.familyMembers.find(
        (m) => m.email === this.newTask.assignedTo
      );
      if (selectedMember) {
        this.newTask.assignedToName =
          selectedMember.fullName ||
          (selectedMember.firstName && selectedMember.lastName
            ? `${selectedMember.firstName} ${selectedMember.lastName}`
            : selectedMember.firstName ||
              selectedMember.lastName ||
              'Unknown Member');
      } else {
        this.newTask.assignedToName = 'Unknown Member';
      }
    }

    // Assign subtasks if not already set
    // Assign subtasks if not already set
    if (Object.keys(this.subTasks).length > 0) {
      this.newTask['subtasks'] = this.subTasks;
    } else {
      delete this.newTask['subtasks'];
    }
    if (this.assignmentType === 'voting') {
      this.votesService.createVote(this.newVote).subscribe({
        next: (response) => {
          console.log('✅ Vote task created:', response);
          this.successMessage = 'Vote created successfully!';
          this.isSubmitting = false;
          this.resetForm();
        },
        error: (error) => {
          console.error('❌ Failed to create vote:', error);
          this.errorMessage = 'Failed to create vote. Please try again.';
          this.isSubmitting = false;
        },
      });
    } else {
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
  }
  // Call the service to create the task

  resetForm(): void {
    this.newTask = {
      assignedToName: '',
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

    this.newVote = {
      createdAt: new Date(),
      description: '',
      dueDate: new Date(),
      startDate: new Date(),
      priority: 'medium',
      title: '',
      adminEmail: '',
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
