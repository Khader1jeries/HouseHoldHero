import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MemberService, Member } from './member.service';
import { TaskService, Task } from './task.service';
import { UserService } from './user.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private members = new BehaviorSubject<Member[]>([]);
  members$ = this.members.asObservable();

  private tasks = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasks.asObservable();

  private dataLoaded = false;
  private familyId: string | null = null;
  private isBrowser: boolean;

  constructor(
    private memberService: MemberService,
    private taskService: TaskService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Try to get the family ID from the current user
    if (this.isBrowser) {
      const user = this.userService.getCurrentUser();
      if (user && user.familyId) {
        this.familyId = user.familyId;
      }
    }
  }

  loadInitialData() {
    if (!this.dataLoaded) {
      if (!this.familyId) {
        console.warn(
          'No family ID available. Some data may not load correctly.'
        );
      }

      // Load members using the updated service
      this.memberService.getMembers(this.familyId || undefined).subscribe({
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

  // Method to update a member in the local store
  updateMember(member: Member): void {
    const currentMembers = this.members.getValue();
    const index = currentMembers.findIndex((m) => m.id === member.id);

    if (index !== -1) {
      const updatedMembers = [...currentMembers];
      updatedMembers[index] = { ...updatedMembers[index], ...member };
      this.members.next(updatedMembers);
    }
  }

  // Method to add a member to the local store
  addMember(member: Member): void {
    const currentMembers = this.members.getValue();
    this.members.next([...currentMembers, member]);
  }

  // Method to remove a member from the local store
  removeMember(memberId: string): void {
    const currentMembers = this.members.getValue();
    this.members.next(currentMembers.filter((m) => m.id !== memberId));
  }

  // Refresh all data
  refreshData() {
    this.dataLoaded = false;
    this.loadInitialData();
  }
}
