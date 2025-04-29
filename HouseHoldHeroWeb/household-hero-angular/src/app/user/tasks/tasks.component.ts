// src/app/user/tasks/tasks.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'upcoming' | 'voting';
  points: number;
  remainingTime?: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  activeTasks: Task[] = [];
  finishedTasks: Task[] = [];
  futureTasks: Task[] = [];
  tasksUnderVoting: Task[] = [];

  activeTab: 'active' | 'finished' | 'future' | 'voting' = 'active';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In a real app, tasks would be fetched from a service
    this.tasks = [
      {
        id: '1',
        title: 'Clean Bathroom',
        description:
          'Clean the entire bathroom, including shower, toilet, and sink',
        assignedTo: 'John',
        dueDate: new Date(2025, 4, 30), // May 30, 2025
        status: 'pending',
        points: 50,
        remainingTime: '0h 5m 20s',
      },
      {
        id: '2',
        title: 'Wash the Car',
        description: 'Wash the family car, including interior vacuuming',
        assignedTo: 'Sarah',
        dueDate: new Date(2025, 4, 29), // May 29, 2025
        status: 'pending',
        points: 75,
        remainingTime: '1h 5m 20s',
      },
      {
        id: '3',
        title: 'Take out Trash',
        description: 'Take all trash bags to the dumpster',
        assignedTo: 'Kavin',
        dueDate: new Date(2025, 4, 28), // May 28, 2025
        status: 'completed',
        points: 20,
      },
      {
        id: '4',
        title: 'Do Laundry',
        description: 'Wash, dry, and fold all household laundry',
        assignedTo: 'John',
        dueDate: new Date(2025, 5, 10), // June 10, 2025
        status: 'upcoming',
        points: 60,
      },
      {
        id: '5',
        title: 'Cook Family Dinner',
        description: 'Prepare dinner for the whole family',
        assignedTo: '',
        dueDate: new Date(2025, 4, 30), // May 30, 2025
        status: 'voting',
        points: 100,
      },
      {
        id: '6',
        title: 'Clean Windows',
        description: 'Clean all windows in the house',
        assignedTo: '',
        dueDate: new Date(2025, 5, 5), // June 5, 2025
        status: 'voting',
        points: 80,
      },
    ];

    // Filter tasks by status
    this.filterTasks();
  }

  filterTasks(): void {
    this.activeTasks = this.tasks.filter((task) => task.status === 'pending');
    this.finishedTasks = this.tasks.filter(
      (task) => task.status === 'completed'
    );
    this.futureTasks = this.tasks.filter((task) => task.status === 'upcoming');
    this.tasksUnderVoting = this.tasks.filter(
      (task) => task.status === 'voting'
    );
  }

  changeTab(tab: 'active' | 'finished' | 'future' | 'voting'): void {
    this.activeTab = tab;
  }

  navigateToAddTask(): void {
    this.router.navigate(['/user/tasks/add']);
  }

  markTaskAsComplete(id: string): void {
    // In a real app, this would call a service
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].status = 'completed';
      this.filterTasks();
    }
  }

  deleteTask(id: string): void {
    // In a real app, this would call a service
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.filterTasks();
  }

  voteForTask(id: string, vote: 'yes' | 'no'): void {
    // In a real app, this would call a service to register the vote
    console.log(`Voted ${vote} for task ${id}`);
    // Just for demo, remove the task from voting after voting
    if (vote === 'yes') {
      const taskIndex = this.tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex].status = 'pending';
        this.tasks[taskIndex].assignedTo = 'You';
        this.filterTasks();
      }
    }
  }
}
