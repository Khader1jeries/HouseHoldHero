// src/app/user/tasks/add-task/add-task.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export class AddTaskComponent {
  newTask = {
    title: '',
    description: '',
    assignedTo: '',
    dueDate: new Date(),
    points: 50,
    status: 'pending' as 'pending' | 'completed' | 'upcoming' | 'voting',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

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

    // Simulate API call to create task
    setTimeout(() => {
      console.log('Creating new task:', this.newTask);
      this.successMessage = 'Task created successfully!';
      this.isSubmitting = false;

      // Redirect back to tasks list after a delay
      setTimeout(() => {
        this.router.navigate(['/user/tasks']);
      }, 2000);
    }, 1500);
  }

  cancel() {
    this.router.navigate(['/user/tasks']);
  }
}
