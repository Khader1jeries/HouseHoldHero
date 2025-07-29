import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VotesService } from '../../../services/votes.service';
import { MemberService } from '../../../services/member.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoteTask } from '../../../services/interfaces/votes.interface';
import { Member } from '../../../services/interfaces/member.interface';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroment';

interface TaskRecommendation {
  success: boolean;
  taskId: string;
  taskTitle: string;
  recommendation: {
    memberId: string;
    memberName: string;
    memberEmail: string;
    calculatedScore: number;
    activeTasks: number;
    overallScore: number;
    reason: string;
  };
}

@Component({
  selector: 'app-move-task',
  templateUrl: './move-task.component.html',
  styleUrls: ['./move-task.component.css'],
  imports: [CommonModule, FormsModule],
})
export class MoveTaskComponent implements OnInit {
  taskId: string = '';
  task: VoteTask = {
    title: '',
    description: '',
    createdAt: null,
    startDate: null,
    dueDate: null,
    priority: '',
    adminEmail: '',
    yes: [],
    no: [],
    subtasks: {},
    comment: '',
  };
  members: Member[] = [];
  adminEmail: string = '';
  loading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  // Recommendation data
  recommendation: TaskRecommendation | null = null;
  loadingRecommendation: boolean = false;
  recommendationError: string = '';

  // Form data for moving the task
  moveTaskData = {
    assignedTo: '',
    startDate: '',
    dueDate: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private votesService: VotesService,
    private memberService: MemberService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadVoteData();
    this.setDefaultDates();
  }

  setDefaultDates(): void {
    // Set start date to today
    const today = new Date();
    this.moveTaskData.startDate = today.toISOString().split('T')[0];

    // Set due date to 7 days from now (or use task's original due date if available)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    this.moveTaskData.dueDate = defaultDueDate.toISOString().split('T')[0];
  }

  loadVoteData(): void {
    this.loading = true;
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    this.adminEmail = sessionStorage.getItem('adminEmail') || '';

    if (!this.taskId || !this.adminEmail) {
      console.error('❌ Task ID or Admin Email missing.');
      this.errorMessage = 'Task ID or Admin Email is missing.';
      this.loading = false;
      return;
    }

    forkJoin({
      task: this.votesService.getVoteById(this.taskId),
      members: this.memberService.getMembers(this.adminEmail),
    }).subscribe({
      next: ({ task, members }) => {
        this.task = task;
        this.members = members;
        this.loading = false;
        console.log('✅ Vote data loaded successfully');

        // Load recommendation after data is loaded
        this.loadRecommendation();
      },
      error: (error) => {
        console.error('❌ Error loading vote data:', error);
        this.errorMessage = 'Failed to load task or member data.';
        this.loading = false;
      },
    });
  }

  loadRecommendation(): void {
    this.loadingRecommendation = true;
    this.recommendationError = '';

    this.http
      .get<TaskRecommendation>(
        `${environment.apiUrl}/tasksUnderVote/recommendation/${this.taskId}`
      )
      .subscribe({
        next: (response) => {
          this.recommendation = response;
          this.loadingRecommendation = false;
          console.log('✅ Recommendation loaded:', response);
        },
        error: (error) => {
          console.error('❌ Error loading recommendation:', error);
          this.recommendationError =
            'Failed to load recommendation. Please try again.';
          this.loadingRecommendation = false;
        },
      });
  }

  getSelectedMemberName(): string {
    const selectedMember = this.members.find(
      (member) => member.email === this.moveTaskData.assignedTo
    );
    return selectedMember
      ? selectedMember.fullName || selectedMember.firstName || 'Unknown'
      : '';
  }

  onMoveTask(): void {
    // Validate form
    if (!this.moveTaskData.assignedTo) {
      this.errorMessage = 'Please select a member to assign the task to.';
      return;
    }

    if (!this.moveTaskData.startDate || !this.moveTaskData.dueDate) {
      this.errorMessage = 'Please provide both start and due dates.';
      return;
    }

    // Validate dates
    const startDate = new Date(this.moveTaskData.startDate);
    const dueDate = new Date(this.moveTaskData.dueDate);

    if (dueDate <= startDate) {
      this.errorMessage = 'Due date must be after start date.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare data for the API
    const moveData = {
      createdAt: new Date().toISOString(),
      startDate: new Date(this.moveTaskData.startDate).toISOString(),
      dueDate: new Date(this.moveTaskData.dueDate).toISOString(),
      assignedTo: this.moveTaskData.assignedTo,
    };

    // Call the move API endpoint
    this.http
      .post(
        `${environment.apiUrl}/tasksUnderVote/move/${this.taskId}`,
        moveData
      )
      .subscribe({
        next: (response: any) => {
          console.log('✅ Task moved successfully:', response);
          this.successMessage = `Task "${
            this.task.title
          }" has been successfully moved and assigned to ${this.getSelectedMemberName()}!`;
          this.isSubmitting = false;

          // Redirect to tasks list after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/user/tasks']);
          }, 2000);
        },
        error: (error) => {
          console.error('❌ Failed to move task:', error);
          this.errorMessage =
            error.error?.error || 'Failed to move task. Please try again.';
          this.isSubmitting = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/user/tasks/votes', this.taskId]);
  }

  goToTasksList(): void {
    this.router.navigate(['/user/tasks']);
  }
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }
}
