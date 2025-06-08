import { Component, HostListener, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterModule,
  NavigationEnd,
  ActivatedRoute,
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
  currentPageTitle: string = '';
  notifications: Notification[] = [];
  showNotifications: boolean = false;
  unreadNotifications: number = 0;
  showUserMenu: boolean = false;
  userData: any = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to router events to update page title
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.urlAfterRedirects);
      });

    // ✅ Get email from query parameters
    const email = this.activatedRoute.snapshot.queryParams['email'];
    if (email) {
      this.userService.getCurrentUser(email).subscribe({
        next: (user) => {
          this.userData = user; // make sure this is bound to the view
          console.log('✅ User loaded:', user);
        },
        error: (err) => {
          console.error('❌ Error fetching user:', err);
        },
      });
    }

    // Initial unread count setup
    this.updateUnreadCount();
  }

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
    this.router.navigate([route], {
      queryParamsHandling: 'merge',
    });
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.showNotifications = false;
    this.showUserMenu = false;
  }

  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    this.updateUnreadCount();
  }

  updateUnreadCount(): void {
    this.unreadNotifications = this.notifications.filter((n) => !n.read).length;
  }

  logout(): void {
    this.userService.logoutUser();
    this.router.navigate(['/guest/home-content']);
  }

  addNotification(sender: string, message: string): void {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      sender,
      message,
      timestamp: new Date(),
      read: false,
    };
    this.notifications.unshift(newNotification);
    this.updateUnreadCount();
  }
}
