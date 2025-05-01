// src/app/user/navbar/navbar.component.ts
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Notification {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  // Notifications
  notifications: Notification[] = [];
  showNotifications: boolean = false;
  unreadNotifications: number = 0;

  // User Menu
  showUserMenu: boolean = false;

  constructor(private router: Router) {
    // Initialize with some mock notifications
    this.notifications = [
      {
        id: '1',
        sender: 'John',
        message: 'You received a new message from John',
        timestamp: new Date(new Date().getTime() - 30 * 60000), // 30 minutes ago
        read: false,
      },
      {
        id: '2',
        sender: 'Kavin',
        message: 'You received a new message from Kavin',
        timestamp: new Date(new Date().getTime() - 2 * 60 * 60000), // 2 hours ago
        read: false,
      },
      {
        id: '3',
        sender: 'Sarah',
        message: 'You received a new message from Sarah',
        timestamp: new Date(new Date().getTime() - 5 * 60 * 60000), // 5 hours ago
        read: true,
      },
    ];

    // Calculate unread notifications
    this.updateUnreadCount();
  }

  navigateTo(route: string): void {
    this.router.navigate([`/user/${route}`]);
  }

  // Toggle notifications dropdown
  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;

    // Close user menu if open
    if (this.showNotifications) {
      this.showUserMenu = false;
    }
  }

  // Toggle user menu dropdown
  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;

    // Close notifications if open
    if (this.showUserMenu) {
      this.showNotifications = false;
    }
  }

  // Listen for clicks outside the dropdowns to close them
  @HostListener('document:click')
  closeDropdowns(): void {
    this.showNotifications = false;
    this.showUserMenu = false;
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    this.updateUnreadCount();
  }

  // Update the unread notification count
  updateUnreadCount(): void {
    this.unreadNotifications = this.notifications.filter((n) => !n.read).length;
  }

  // Logout
  logout(): void {
    // In a real app, this would call a service to handle logout
    console.log('Logging out');
    this.router.navigate(['/guest/login']);
  }

  // Add a notification (could be called from a service in a real app)
  addNotification(sender: string, message: string): void {
    const newNotification: Notification = {
      id: (this.notifications.length + 1).toString(),
      sender,
      message,
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.updateUnreadCount();
  }
}
