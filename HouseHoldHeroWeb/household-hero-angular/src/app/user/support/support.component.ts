// src/app/user/support/support.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Member } from '../../services/interfaces/member.interface';
import { SupportService } from '../../services/support.service';
import { MemberService } from '../../services/member.service';
import { forkJoin, from } from 'rxjs';
import { Message } from '../../services/interfaces/support.interface';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent implements OnInit {
  messages: Message[] = [];
  members: Member[] = [];
  newMessage = {
    subject: '',
    content: '',
  };
  successMessage = '';
  errorMessage = '';
  adminEmail: string = '';
  showComposeForm = false;
  constructor(
    private supportService: SupportService,
    private membersService: MemberService
  ) {}
  ngOnInit(): void {
    const email = sessionStorage.getItem('adminEmail');
    if (!email) {
      this.errorMessage = 'Missing admin session.';
      return;
    }
    this.adminEmail = email;
    this.fetchMessages();
  }
  fetchMessages(): void {
    const adminEmail = this.adminEmail;

    const messages$ = from(this.supportService.getMessages(adminEmail));
    const members$ = from(this.membersService.getMembers(adminEmail));

    forkJoin({
      messages: messages$,
      members: members$,
    }).subscribe({
      next: ({ messages, members }) => {
        this.messages = messages;
        this.members = members.map((m: any) => ({
          email: m.email,
          adminEmail: m.adminEmail,
          fullName: m.fullName,
          countryCode: m.countryCode,
          phoneNumber: m.phoneNumber,
          createdAt: m.createdAt,
          profileImage: m.profileImage || '',
          status: m.status || 'active',
          score: m.score || 0, // if used
          firstName: m.firstName || '',
          lastName: m.lastName || '',
          DOB: m.DOB || '',
        }));
      },
      error: (err) => {
        console.error('Failed to fetch messages or members:', err);
        this.errorMessage = 'Failed to load messages or members.';
      },
    });
  }
  selectedRecipients = new Set<string>();
  toggleComposeForm(): void {
    this.showComposeForm = !this.showComposeForm;

    if (this.showComposeForm) {
      // reset form fields
      this.newMessage = { subject: '', content: '' };

      // clear previous selections
      this.selectedRecipients.clear();

      this.successMessage = '';
      this.errorMessage = '';
    }
  }
  onToggleRecipient(email: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedRecipients.add(email);
    } else {
      this.selectedRecipients.delete(email);
    }
  }
}
