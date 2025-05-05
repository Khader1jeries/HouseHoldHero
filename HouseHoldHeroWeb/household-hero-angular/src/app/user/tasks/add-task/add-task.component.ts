// src/app/user/tasks/add-task/add-task.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

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
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'General',
  };

  // Assignment type - direct or voting
  assignmentType = 'direct';

  // For adding subtasks
  subTasks: SubTask[] = [];
  newSubTaskTitle = '';

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

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

    // Set the status based on assignment type
    if (this.assignmentType === 'voting') {
      this.newTask.status = 'voting';
      this.newTask.assignedTo = ''; // Clear assigned member when voting
    }

    // Simulate API call to create task
    setTimeout(() => {
      console.log('Creating new task:', this.newTask);
      console.log('With subtasks:', this.subTasks);

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
