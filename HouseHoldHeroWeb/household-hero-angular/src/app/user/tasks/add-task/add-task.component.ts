// src/app/user/tasks/add-task/add-task.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService, Task, SubTask } from '../../../services/task.service';
import { MemberService } from '../../../services/member.service';
import { UserService } from '../../../services/user.service';
import { Member } from '../../../services/interfaces/member.interface';
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

  ngOnInit(): void {}

  loadFamilyMembers(familyId: string): void {}

  addSubTask(): void {}

  removeSubTask(index: number): void {}

  onSubmit(): void {}

  cancel(): void {}
}
