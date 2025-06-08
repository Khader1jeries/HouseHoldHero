import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MemberService, Member } from '../../services/member.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit {
  members: Member[] = [];
  topMembers: Member[] = [];
  showLeaderboard: boolean = true;
  isLoading: boolean = true;
  error: string | null = null;
  familyId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private memberService: MemberService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    console.log('🔄 ngOnInit called');
    this.loadMembers();
  }

  loadMembers(): void {
    const email = this.route.snapshot.queryParams['email'];
    if (!email) {
      console.error('❌ Missing email in queryParams');
      return;
    }

    console.log('📨 Fetching members for email:', email);

    this.memberService.getMembers(email).subscribe({
      next: (members) => {
        console.log('✅ Members received from service:', members);
        this.members = members;
        this.topMembers = [...members]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching members:', err);
        this.error = 'Failed to load members.';
        this.isLoading = false;
      },
    });
  }

  navigateToAddMember(): void {}

  navigateToMemberDetails(id: string | undefined): void {}

  deleteMember(id: string | undefined, event: Event): void {}

  editMember(id: string | undefined, event: Event): void {}

  toggleLeaderboard(): void {}

  navigateToLeaderboard(): void {}

  getTotalScore(): number {
    return 0;
  }

  getAverageScore(): number {
    return 0;
  }

  getActiveMembers(): number {
    return 0;
  }
}
