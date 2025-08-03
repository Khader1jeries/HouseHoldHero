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
  memberMessages: Message[] = []; // Messages from members only
  members: Member[] = [];
  newMessage = {
    subject: '',
    content: '',
  };
  successMessage = '';
  errorMessage = '';
  adminEmail: string = '';
  showComposeForm = false;
  showReplyForm = false;
  replyingToMessage: any = null;
  replyContent = '';
  selectedRecipients = new Set<string>();

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
          score: m.score || 0,
          firstName: m.firstName || '',
          lastName: m.lastName || '',
          DOB: m.DOB || '',
        }));

        // Filter messages to show only those from members
        this.memberMessages = messages
          .filter((msg: any) => {
            return this.members.some((member) => member.email === msg.from);
          })
          .map((msg: any) => ({
            ...msg,
            sender:
              this.members.find((m) => m.email === msg.from)?.fullName ||
              msg.from,
            timestamp: msg.createdAt?.toDate
              ? msg.createdAt.toDate()
              : new Date(msg.createdAt),
            read: msg.read || false,
          }));
      },
      error: (err) => {
        console.error('Failed to fetch messages or members:', err);
        this.errorMessage = 'Failed to load messages or members.';
      },
    });
  }

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
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedRecipients.add(email);
    } else {
      this.selectedRecipients.delete(email);
    }

    // Debug log to verify it's working
    console.log('Selected recipients:', Array.from(this.selectedRecipients));
  }

  sendMessage(): void {
    // Validate form
    if (!this.newMessage.subject.trim() || !this.newMessage.content.trim()) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.selectedRecipients.size === 0) {
      this.errorMessage = 'Please select at least one recipient.';
      return;
    }

    // Send message to each selected recipient
    const sendPromises = Array.from(this.selectedRecipients).map(
      (recipientEmail) => {
        const message: Message = {
          to: recipientEmail,
          from: this.adminEmail,
          subject: this.newMessage.subject,
          message: this.newMessage.content, // Note: backend expects 'message' not 'content'
          reply: null,
          createdAt: new Date(),
        };

        return this.supportService.sendMessage(message).toPromise();
      }
    );

    Promise.all(sendPromises)
      .then(() => {
        this.successMessage = 'Message sent successfully!';
        this.toggleComposeForm();
        // Refresh messages after sending
        this.fetchMessages();
      })
      .catch((error) => {
        console.error('Error sending messages:', error);
        this.errorMessage = 'Failed to send message. Please try again.';
      });
  }

  markAsRead(messageId?: string): void {
    if (!messageId) {
      return;
    }

    /* ---- optimistic UI update ------------------------------------------- */
    const localMsg = this.memberMessages.find((m) => m.id === messageId);
    if (localMsg && !localMsg.read) {
      localMsg.read = true; // immediately remove “unread” styling
    }

    /* ---- backend call ---------------------------------------------------- */
    this.supportService.markAsRead(messageId).subscribe({
      next: () => {
        // success – UI already up-to-date
      },
      error: (err) => {
        console.error('Failed to mark message as read:', err);

        // optional rollback if you want to keep UI strictly accurate
        if (localMsg) {
          localMsg.read = false;
        }
      },
    });
  }

  replyToMessage(message: any): void {
    console.log('Reply button clicked for message:', message);

    // Show reply form instead of compose form
    this.showComposeForm = false;
    this.showReplyForm = true;
    this.replyingToMessage = message;
    this.replyContent = '';
    this.successMessage = '';
    this.errorMessage = '';

    console.log('Reply form state:', {
      showReplyForm: this.showReplyForm,
      replyingToMessage: this.replyingToMessage,
    });
  }

  cancelReply(): void {
    this.showReplyForm = false;
    this.replyingToMessage = null;
    this.replyContent = '';
  }

  sendReply(): void {
    if (!this.replyContent.trim()) {
      this.errorMessage = 'Please enter a reply message.';
      return;
    }

    // Call the backend to update the message with reply
    this.supportService
      .replyToMessage(this.replyingToMessage.id, this.replyContent)
      .subscribe({
        next: () => {
          this.successMessage = 'Reply sent successfully!';
          this.cancelReply();
          // Refresh messages to remove the replied message
          this.fetchMessages();
        },
        error: (error) => {
          console.error('Error sending reply:', error);
          this.errorMessage = 'Failed to send reply. Please try again.';
        },
      });
  }

  deleteMessage(id: string): void {
    this.supportService.deleteMessage(id).subscribe({
      next: () => {
        // refresh the list from Firestore
        this.fetchMessages();
      },
      error: (err) => {
        console.error('Failed to delete message:', err);
        this.errorMessage = 'Could not delete the message.';
      },
    });
  }
}
