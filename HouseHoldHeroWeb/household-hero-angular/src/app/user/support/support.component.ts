// src/app/user/support/support.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent implements OnInit {
  messages: Message[] = [];
  showComposeForm = false;

  newMessage = {
    subject: '',
    content: '',
    recipient: 'admin@householdhero.com', // Default recipient
  };

  successMessage = '';
  errorMessage = '';

  constructor() {}

  ngOnInit(): void {
    // In a real app, you would fetch this data from a service
    this.messages = [
      {
        id: '1',
        sender: 'John',
        recipient: 'admin@householdhero.com',
        subject: 'Cannot complete washing task',
        content:
          'The washing machine is not working properly. Can someone come and fix it?',
        timestamp: new Date(2025, 3, 25, 14, 30), // April 25, 2025, 14:30
        read: true,
      },
      {
        id: '2',
        sender: 'Kavin',
        recipient: 'admin@householdhero.com',
        subject: 'Need help with gardening task',
        content:
          "I don't know how to use the lawn mower. Can you provide some instructions?",
        timestamp: new Date(2025, 3, 27, 9, 15), // April 27, 2025, 9:15
        read: false,
      },
      {
        id: '3',
        sender: 'Sarah',
        recipient: 'admin@householdhero.com',
        subject: 'Too many tasks assigned',
        content:
          'I think I have too many tasks assigned for this week. Can we redistribute some of them?',
        timestamp: new Date(2025, 3, 28, 18, 45), // April 28, 2025, 18:45
        read: false,
      },
      {
        id: '4',
        sender: 'Admin',
        recipient: 'John',
        subject: 'RE: Cannot complete washing task',
        content:
          "I'll send someone to check the washing machine tomorrow. In the meantime, you can skip this task.",
        timestamp: new Date(2025, 3, 26, 10, 20), // April 26, 2025, 10:20
        read: true,
      },
    ];
  }

  toggleComposeForm(): void {
    this.showComposeForm = !this.showComposeForm;
    if (this.showComposeForm) {
      this.newMessage = {
        subject: '',
        content: '',
        recipient: 'admin@householdhero.com',
      };
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  sendMessage(): void {
    // Basic validation
    if (!this.newMessage.subject || !this.newMessage.content) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    // In a real app, this would call a service to send the message
    console.log('Sending message:', this.newMessage);

    // Simulate adding the message to the list
    const message: Message = {
      id: (this.messages.length + 1).toString(),
      sender: 'You',
      recipient: this.newMessage.recipient,
      subject: this.newMessage.subject,
      content: this.newMessage.content,
      timestamp: new Date(),
      read: true,
    };

    this.messages.unshift(message);

    // Reset form and show success message
    this.successMessage = 'Message sent successfully!';
    setTimeout(() => {
      this.showComposeForm = false;
      this.successMessage = '';
    }, 2000);
  }

  markAsRead(id: string): void {
    const messageIndex = this.messages.findIndex((msg) => msg.id === id);
    if (messageIndex !== -1) {
      this.messages[messageIndex].read = true;
    }
  }

  deleteMessage(id: string): void {
    this.messages = this.messages.filter((msg) => msg.id !== id);
  }

  getUnreadCount(): number {
    return this.messages.filter((msg) => !msg.read).length;
  }
}
