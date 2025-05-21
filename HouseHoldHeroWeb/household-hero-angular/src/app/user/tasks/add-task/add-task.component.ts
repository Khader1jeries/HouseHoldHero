// src/app/user/tasks/add-task/add-task.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService, Task, SubTask } from '../../../services/task.service';
import { MemberService } from '../../../services/member.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export class AddTaskComponent implements OnInit {
  cancel() {
    throw new Error('Method not implemented.');
  }
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
  familyMembers: { id: string; name: string }[] = [];

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
      }
    }
  }

  loadFamilyMembers(familyId: string | undefined): void {
    if (!familyId) {
      console.error('No family ID provided for loading members');
      return;
    }

    this.memberService.getMembers(familyId).subscribe({
      next: (members) => {
        this.familyMembers = members.map((member) => ({
          id: member.id || '',
          name:
            member.fullName ||
            member.name ||
            `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
            'Unknown',
        }));
      },
      error: (err) => {
        console.error('Error loading family members:', err);
        this.errorMessage =
          'Failed to load family members. You can still create the task.';
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
    }
  }
}
