// src/app/user/tasks/votes/votes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Task, Vote } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';

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

  ngOnInit(): void {
    // Get the current user
    this.currentUser = this.userService.getCurrentUser();
    if (!this.currentUser) {
      console.error('User not logged in');
      this.router.navigate(['/guest/login']);
      return;
    }

    // Get the task ID from the route parameters
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.taskId = params['id'];
        this.loadTaskData();
      }
    });
  }

  loadTaskData(): void {
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (data) => {
        this.task = data;

        // Determine the voting result
        if (this.task) {
          this.determineVotingResult();
          this.checkCurrentUserVoted();
        }
      },
      error: (err) => {
        console.error('Error loading task data:', err);
        this.errorMessage = 'Failed to load task data. Please try again.';
      },
    });
  }

  determineVotingResult(): void {
    if (!this.task) return;

    const votesYes = this.task.votesYes || 0;
    const votesNo = this.task.votesNo || 0;

    if (votesYes > votesNo) {
      this.votingResult = 'approved';
    } else if (votesYes < votesNo) {
      this.votingResult = 'rejected';
    } else {
      this.votingResult = 'pending';
    }
  }

  checkCurrentUserVoted(): void {
    if (!this.task || !this.task.votes || !this.currentUser) return;

    this.currentUserVoted = this.task.votes.some(
      (vote) => vote.memberId === this.currentUser.uid
    );
  }

  vote(voteType: 'yes' | 'no'): void {
    if (!this.task || !this.currentUser) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const voteData: Vote = {
      memberId: this.currentUser.uid,
      memberName:
        this.currentUser.fullName ||
        `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      memberImage: 'assets/profile_pic.png', // You could fetch actual profile image if available
      vote: voteType,
      timestamp: new Date(),
      comment: this.voteComment,
    };

    this.taskService.addVote(this.taskId, voteData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = `Your vote has been recorded!`;
        this.currentUserVoted = true;

        // Update the task data to reflect the new vote
        if (!this.task) return;

        // Add the vote to the votes array
        if (!this.task.votes) {
          this.task.votes = [];
        }
        this.task.votes.push(voteData);

        // Update vote counts
        if (voteType === 'yes') {
          this.task.votesYes = (this.task.votesYes || 0) + 1;
        } else {
          this.task.votesNo = (this.task.votesNo || 0) + 1;
        }

        // Recalculate voting result
        this.determineVotingResult();

        // Clear vote comment
        this.voteComment = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err.error?.error || 'Failed to record your vote. Please try again.';
        console.error('Error submitting vote:', err);
      },
    });
  }

  assignTask(): void {
    if (!this.task) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Find members who voted yes
    const yesVoters =
      this.task.votes?.filter((vote) => vote.vote === 'yes') || [];

    if (yesVoters.length === 0) {
      this.errorMessage = 'No members voted yes for this task.';
      this.isSubmitting = false;
      return;
    }

    // Select a random yes voter to assign the task to
    const randomIndex = Math.floor(Math.random() * yesVoters.length);
    const selectedVoter = yesVoters[randomIndex];

    this.taskService
      .assignTaskFromVoting(this.taskId, selectedVoter.memberId)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = `Task assigned to ${selectedVoter.memberName} successfully!`;

          // Navigate back to tasks list after a delay
          setTimeout(() => {
            this.router.navigate(['/user/tasks']);
          }, 2000);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage =
            err.error?.error || 'Failed to assign task. Please try again.';
          console.error('Error assigning task:', err);
        },
      });
  }

  reopenVoting(): void {
    if (!this.task) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.taskService.reopenVoting(this.taskId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Voting reopened successfully!';

        // Reset votes in the UI
        if (this.task) {
          this.task.votes = [];
          this.task.votesYes = 0;
          this.task.votesNo = 0;
          this.votingResult = 'pending';
          this.currentUserVoted = false;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err.error?.error || 'Failed to reopen voting. Please try again.';
        console.error('Error reopening voting:', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/user/tasks']);
  }
}
