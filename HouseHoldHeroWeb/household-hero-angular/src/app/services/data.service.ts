// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MemberService, Member } from './member.service';
import { TaskService, Task } from './task.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private members = new BehaviorSubject<Member[]>([]);
  members$ = this.members.asObservable();

  private tasks = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasks.asObservable();

  private dataLoaded = false;

  constructor(
    private memberService: MemberService,
    private taskService: TaskService
  ) {}

  loadInitialData() {
    if (!this.dataLoaded) {
      // Load members
      this.memberService.getMembers().subscribe({
        next: (data) => {
          console.log('Members loaded:', data);
          this.members.next(data);
        },
        error: (err) => console.error('Error loading members:', err),
      });

      // Load tasks
      this.taskService.getTasks().subscribe({
        next: (data) => {
          console.log('Tasks loaded:', data);
          this.tasks.next(data);
        },
        error: (err) => console.error('Error loading tasks:', err),
      });

      this.dataLoaded = true;
    }
  }

  getMembers(): Observable<Member[]> {
    return this.members$;
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  // You can add more methods for updating, adding, or deleting data
  refreshData() {
    this.dataLoaded = false;
    this.loadInitialData();
  }
}
