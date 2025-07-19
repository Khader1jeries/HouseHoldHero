// src/app/user/tasks/votes/votes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Vote } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';
import { Task } from '../../../services/interfaces/task.interface';
@Component({
  selector: 'app-votes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './votes.component.html',
  styleUrl: './votes.component.css',
})
export class VotesComponent implements OnInit {
  taskId: string = '';
  task?: Task;
  votingResult: 'pending' | 'approved' | 'rejected' = 'pending';
  currentUserVoted: boolean = false;
  currentUser: any;
  voteComment: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit(): void {}

  loadTaskData(): void {}

  determineVotingResult(): void {}

  checkCurrentUserVoted(): void {}

  vote(voteType: 'yes' | 'no'): void {}

  assignTask(): void {}

  reopenVoting(): void {}

  goBack(): void {}
}
