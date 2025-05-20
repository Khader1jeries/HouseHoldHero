// src/app/user/navbar/navbar.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterModule,
  NavigationEnd,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { UserService } from '../../services/user.service';

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
export class NavbarComponent implements OnInit {
  // Current page title
  currentPageTitle: string = 'Dashboard';

  // Notifications
  notifications: Notification[] = [];
  showNotifications: boolean = false;
  unreadNotifications: number = 0;

  // User Menu
  showUserMenu: boolean = false;

  // User data
  userData: any = null;

  constructor(private router: Router, private userService: UserService) {
    // Listen to route changes to update the page title
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updatePageTitle(event.url);
      });

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

  ngOnInit(): void {
    // Set initial page title based on current URL
    this.updatePageTitle(this.router.url);

    // Get user data from UserService
    this.userData = this.userService.getCurrentUser();
  }

  // Update page title based on route
  updatePageTitle(url: string): void {
    if (url.includes('/user/members')) {
      this.currentPageTitle = 'Members';
    } else if (url.includes('/user/tasks')) {
      this.currentPageTitle = 'Tasks';
    } else if (url.includes('/user/support')) {
      this.currentPageTitle = 'Support';
    } else if (url.includes('/user/analytics')) {
      this.currentPageTitle = 'Analytics';
    } else if (url.includes('/user/reports')) {
      this.currentPageTitle = 'Reports';
    } else if (url.includes('/user/settings')) {
      this.currentPageTitle = 'Settings';
    } else {
      this.currentPageTitle = 'Dashboard';
    }
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
    // Use the UserService logout method
    this.userService.logoutUser();
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
