// src/app/user/tasks/votes/votes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Vote {
  memberId: string;
  memberName: string;
  memberImage: string;
  vote: 'yes' | 'no';
  timestamp: Date;
  comment?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  points: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
  votes: Vote[];
  votesYes: number;
  votesNo: number;
}

@Component({
  selector: 'app-votes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './votes.component.html',
  styleUrl: './votes.component.css',
})
export class VotesComponent implements OnInit {
  taskId: string = '';
  task?: Task;
  votingResult: 'pending' | 'approved' | 'rejected' = 'pending';
  currentUserVoted: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Get the task ID from the route parameters
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.taskId = params['id'];
        this.loadTaskData();
      }
    });
  }

  loadTaskData(): void {
    // In a real app, this would call a service to get the data
    // For now, we'll use mock data
    const mockTasks: { [key: string]: Task } = {
      '5': {
        id: '5',
        title: 'Cook Family Dinner',
        description: 'Prepare dinner for the whole family on Saturday evening.',
        dueDate: new Date(2025, 4, 30),
        points: 100,
        category: 'Cooking',
        priority: 'medium',
        votesYes: 3,
        votesNo: 2,
        votes: [
          {
            memberId: '1',
            memberName: 'John',
            memberImage: 'assets/profile_pic.png',
            vote: 'yes',
            timestamp: new Date(2025, 4, 25, 10, 30),
            comment: 'I can help with this task.',
          },
          {
            memberId: '2',
            memberName: 'Kavin',
            memberImage: 'assets/profile_pic.png',
            vote: 'yes',
            timestamp: new Date(2025, 4, 25, 11, 45),
          },
          {
            memberId: '3',
            memberName: 'Sarah',
            memberImage: 'assets/profile_pic.png',
            vote: 'no',
            timestamp: new Date(2025, 4, 25, 14, 20),
            comment: 'I have other plans that evening.',
          },
          {
            memberId: '4',
            memberName: 'Admin',
            memberImage: 'assets/profile_pic.png',
            vote: 'yes',
            timestamp: new Date(2025, 4, 26, 9, 15),
          },
          {
            memberId: '5',
            memberName: 'Emma',
            memberImage: 'assets/profile_pic.png',
            vote: 'no',
            timestamp: new Date(2025, 4, 26, 16, 30),
            comment: 'I would prefer to do this next week.',
          },
        ],
      },
      '6': {
        id: '6',
        title: 'Clean Windows',
        description: 'Clean all windows in the house, inside and outside.',
        dueDate: new Date(2025, 5, 5),
        points: 80,
        category: 'Cleaning',
        priority: 'low',
        votesYes: 1,
        votesNo: 4,
        votes: [
          {
            memberId: '1',
            memberName: 'John',
            memberImage: 'assets/profile_pic.png',
            vote: 'no',
            timestamp: new Date(2025, 4, 26, 11, 30),
            comment: 'I have a fear of heights.',
          },
          {
            memberId: '2',
            memberName: 'Kavin',
            memberImage: 'assets/profile_pic.png',
            vote: 'no',
            timestamp: new Date(2025, 4, 26, 12, 45),
            comment: 'I did this last time.',
          },
          {
            memberId: '3',
            memberName: 'Sarah',
            memberImage: 'assets/profile_pic.png',
            vote: 'no',
            timestamp: new Date(2025, 4, 26, 15, 20),
          },
          {
            memberId: '4',
            memberName: 'Admin',
            memberImage: 'assets/profile_pic.png',
            vote: 'yes',
            timestamp: new Date(2025, 4, 27, 9, 15),
            comment: 'Someone needs to do this.',
          },
          {
            memberId: '5',
            memberName: 'Emma',
            memberImage: 'assets/profile_pic.png',
            vote: 'no',
            timestamp: new Date(2025, 4, 27, 10, 30),
          },
        ],
      },
    };

    this.task = mockTasks[this.taskId];

    if (this.task) {
      // Determine the voting result
      if (this.task.votesYes > this.task.votesNo) {
        this.votingResult = 'approved';
      } else if (this.task.votesYes < this.task.votesNo) {
        this.votingResult = 'rejected';
      } else {
        this.votingResult = 'pending';
      }

      // Check if current user has voted (mock user ID = '1' for John)
      this.currentUserVoted = this.task.votes.some(
        (vote) => vote.memberId === '1'
      );
    }
  }

  vote(voteType: 'yes' | 'no'): void {
    if (!this.task) return;

    // In a real app, this would call a service to submit the vote
    console.log(`Voting ${voteType} for task ${this.taskId}`);

    // For demo purposes, let's add the vote to the list (mock)
    if (!this.currentUserVoted) {
      const newVote: Vote = {
        memberId: '1', // Assuming current user is John
        memberName: 'John',
        memberImage: 'assets/profile_pic.png',
        vote: voteType,
        timestamp: new Date(),
      };

      this.task.votes.push(newVote);
      this.currentUserVoted = true;

      // Update vote count
      if (voteType === 'yes') {
        this.task.votesYes++;
      } else {
        this.task.votesNo++;
      }

      // Re-determine the voting result
      if (this.task.votesYes > this.task.votesNo) {
        this.votingResult = 'approved';
      } else if (this.task.votesYes < this.task.votesNo) {
        this.votingResult = 'rejected';
      } else {
        this.votingResult = 'pending';
      }
    }
  }

  assignTask(): void {
    if (!this.task) return;

    // In a real app, this would call a service to assign the task
    console.log(`Assigning task ${this.taskId} based on votes`);

    // Navigate back to tasks list after a delay
    setTimeout(() => {
      this.router.navigate(['/user/tasks']);
    }, 1500);
  }

  reopenVoting(): void {
    if (!this.task) return;

    // In a real app, this would call a service to reopen voting
    console.log(`Reopening voting for task ${this.taskId}`);

    // For demo purposes, let's reset the votes (mock)
    this.task.votes = [];
    this.task.votesYes = 0;
    this.task.votesNo = 0;
    this.votingResult = 'pending';
    this.currentUserVoted = false;
  }

  goBack(): void {
    this.router.navigate(['/user/tasks']);
  }
}
