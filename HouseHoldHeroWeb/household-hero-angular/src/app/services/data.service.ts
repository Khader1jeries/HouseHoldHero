import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
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
  }

  loadInitialData(): void {}

  getMembers(): Observable<Member[]> {
    return this.members$;
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  updateMember(member: Member): void {}

  addMember(member: Member): void {}

  removeMember(memberId: string): void {}

  refreshData(): void {}
}
