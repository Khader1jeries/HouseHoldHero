// src/app/user/tasks/votes/votes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Vote } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';
import { Task } from '../../../services/interfaces/task.interface';
import { VoteTask } from '../../../services/interfaces/votes.interface';
import { VotesService } from '../../../services/votes.service';
import { MemberService } from '../../../services/member.service';
import { Member } from '../../../services/interfaces/member.interface';
import { forkJoin } from 'rxjs';
import { LoadingComponent } from '../../../loading/loading.component';
@Component({
  selector: 'app-votes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './votes.component.html',
  styleUrl: './votes.component.css',
})
export class VotesComponent implements OnInit {
  navigateToMoveTask(): void {
    const taskId = this.route.snapshot.params['id']; // current task ID from URL

    if (taskId) {
      this.router.navigate(['user/tasks/moveTask', taskId]); // navigate with ID
    } else {
      console.error('Task ID not found in URL');
    }
  }
  taskId: string = '';
  loading: boolean = true;
  task?: VoteTask;
  votingResult: 'pending' | 'approved' | 'rejected' = 'pending';
  currentUserVoted: boolean = false;
  currentUser: any;
  voteComment: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  members: Member[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private votesService: VotesService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.loadVoteData();
  }

  loadVoteData(): void {
    this.loading = true;
    const taskId = this.route.snapshot.paramMap.get('id');
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!taskId || !adminEmail) {
      console.error('❌ Task ID or Admin Email missing.');
      this.loading = false;
      return;
    }

    forkJoin({
      task: this.votesService.getVoteById(taskId),
      members: this.memberService.getMembers(adminEmail),
    }).subscribe({
      next: ({ task, members }) => {
        this.task = task;
        this.members = members;
        console.log('✅ Task and members loaded:', { task, members });
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load vote data:', err);
        this.errorMessage = 'Failed to load vote task or members.';
        this.loading = false;
      },
    });
  }
  checkVote(email: string): string {
    console.log('Yes votes:', this.task?.yes);
    console.log('No votes:', this.task?.no);
    if (this.task?.yes?.includes(email)) return 'yes';
    if (this.task?.no?.includes(email)) return 'no';
    return 'not voted';
  }

  goBack(): void {
    this.router.navigate(['/user/tasks']);
  }
}
