import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VotesService } from '../../../services/votes.service';
import { MemberService } from '../../../services/member.service';
import { CommonModule } from '@angular/common';
import { VoteTask } from '../../../services/interfaces/votes.interface';
import { Member } from '../../../services/interfaces/member.interface';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-move-task',
  templateUrl: './move-task.component.html',
  styleUrls: ['./move-task.component.css'],
  imports: [CommonModule],
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
  getSubtaskKeys(subtasks: {
    [key: string]: { score: number; status: boolean };
  }): string[] {
    return Object.keys(subtasks || {});
  }

  constructor(
    private route: ActivatedRoute,
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
}
