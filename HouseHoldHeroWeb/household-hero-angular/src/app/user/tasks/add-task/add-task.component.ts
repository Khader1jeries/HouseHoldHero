// src/app/user/tasks/add-task/add-task.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService, Task, SubTask } from '../../../services/task.service';
import { MemberService, Member } from '../../../services/member.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export class AddTaskComponent implements OnInit {
  newTask: Task = {
    title: '',
    description: '',
    assignedTo: '',
    dueDate: new Date(),
    points: 50,
    status: 'pending',
    priority: 'medium',
    category: 'General',
    createdBy: '',
    createdDate: new Date(),
  };

  // Family members for the dropdown
  familyMembers: Member[] = [];

  // Assignment type - direct or voting
  assignmentType = 'direct';

  // For adding subtasks
  subTasks: SubTask[] = [];
  newSubTaskTitle = '';

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
    // Set the current user as the creator
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.newTask.createdBy =
        currentUser.fullName ||
        `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();

      // Only set familyId if it exists
      if (currentUser.familyId) {
        this.newTask.familyId = currentUser.familyId;

        // Load family members for the dropdown
        this.loadFamilyMembers(currentUser.familyId);
      } else {
        console.warn('No family ID found for current user');
        this.errorMessage = 'No family ID found. Please set up a family first.';
      }
    } else {
      console.warn('No current user found');
      this.errorMessage = 'You need to be logged in to create tasks.';
    }
  }

  // Load family members from the service using the family ID
  loadFamilyMembers(familyId: string): void {
    console.log(`Loading family members for family ID: ${familyId}`);

    this.memberService.getMembers(familyId).subscribe({
      next: (members) => {
        console.log('Loaded family members:', members);
        if (members && members.length > 0) {
          this.familyMembers = members;
        } else {
          console.warn('No family members found');
          this.errorMessage =
            'No family members found. Please add family members first.';
        }
      },
      error: (err) => {
        console.error('Error loading family members:', err);
        this.errorMessage =
          'Failed to load family members. Please try again later.';
      },
    });
  }

  // Add a new subtask
  addSubTask(): void {
    if (!this.newSubTaskTitle.trim()) return;

    const newSubTask: SubTask = {
      id: `new-${this.subTasks.length + 1}`,
      title: this.newSubTaskTitle.trim(),
      completed: false,
    };

    this.subTasks.push(newSubTask);
    this.newSubTaskTitle = '';
  }

  // Remove a subtask
  removeSubTask(index: number): void {
    this.subTasks.splice(index, 1);
  }

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (!this.newTask.title) {
      this.errorMessage = 'Task title is required';
      this.isSubmitting = false;
      return;
    }

    // Format the task based on assignment type
    if (this.assignmentType === 'voting') {
      this.newTask.status = 'voting';
      this.newTask.assignedTo = ''; // Clear assigned member when voting
      this.newTask.votesYes = 0;
      this.newTask.votesNo = 0;
      this.newTask.votes = [];
    } else if (!this.newTask.assignedTo) {
      this.errorMessage = 'Please select a family member to assign this task';
      this.isSubmitting = false;
      return;
    }

    // Add subtasks to the task if there are any
    if (this.subTasks.length > 0) {
      this.newTask.subTasks = this.subTasks;
    }

    // Make sure dates are proper Date objects
    if (!(this.newTask.dueDate instanceof Date)) {
      try {
        this.newTask.dueDate = new Date(this.newTask.dueDate);
      } catch (e) {
        console.error('Invalid due date:', this.newTask.dueDate);
        this.newTask.dueDate = new Date(); // Use current date as fallback
      }
    }

    // Check if family ID exists
    if (!this.newTask.familyId) {
      this.errorMessage = 'Family ID is required to create a task';
      this.isSubmitting = false;
      return;
    }

    // For debugging purposes
    console.log('Creating task:', this.newTask);

    // Submit the task to the server
    this.taskService.createTask(this.newTask).subscribe({
      next: (response) => {
        console.log('Task created successfully:', response);
        this.successMessage = 'Task created successfully!';
        this.isSubmitting = false;

        // Navigate back to tasks list after a delay
        setTimeout(() => {
          this.router.navigate(['/user/tasks']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.errorMessage =
          err.error?.error || 'Failed to create task. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  cancel() {
    this.router.navigate(['/user/tasks']);
  }
}
