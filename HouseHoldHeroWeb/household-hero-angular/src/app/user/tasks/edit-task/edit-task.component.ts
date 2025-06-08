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

  familyMembers: { id: string; name: string }[] = [];

  categories: string[] = [
    'Cleaning',
    'Cooking',
    'Outdoors',
    'Shopping',
    'Maintenance',
    'General',
  ];

  newSubTaskTitle: string = '';

  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = true;

  dueDateStr: string = '';
  startDateStr: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {}

  loadTaskData(): void {}

  loadFamilyMembers(): void {}

  formatDateForInput(date: Date): string {
    return '';
  }

  onDueDateChange(event: any): void {}

  onStartDateChange(event: any): void {}

  addSubTask(): void {}

  removeSubTask(index: number): void {}

  toggleSubTask(index: number): void {}

  saveTask(): void {}

  cancel(): void {}
}
