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
  };

  familyMembers: Member[] = [];
  assignmentType = 'direct';
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

  addSubTask(): void {}

  removeSubTask(index: number): void {}

  onSubmit(): void {}

  cancel(): void {}
}
