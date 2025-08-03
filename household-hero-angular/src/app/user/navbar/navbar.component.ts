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
import { SupportService } from '../../services/support.service'; // ⬅️ add
import { Message } from '../../services/interfaces/support.interface';
import { forkJoin } from 'rxjs';
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
    private supportService: SupportService
  ) {}

  ngOnInit(): void {
    /* update page title on route change */
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) =>
        this.updatePageTitle(e.urlAfterRedirects)
      );

    const adminEmail = sessionStorage.getItem('adminEmail');
    if (!adminEmail) return;

    /* fetch user & their messages in parallel */
    forkJoin({
      user: this.userService.getCurrentUser(adminEmail),
      messages: this.supportService.getMessages(adminEmail),
    }).subscribe({
      next: ({ user, messages }) => {
        this.userData = user;

        /* convert Message → Notification */
        this.notifications = (messages as Message[]).map((m) => ({
          id: m.id!,
          sender: m.from, // display “from”
          message: m.message ?? m.content ?? '(no text)',
          timestamp: m.createdAt?.toDate
            ? m.createdAt.toDate()
            : (m.timestamp as Date) ?? new Date(),
          read: !!m.read,
        }));

        /* newest first */
        this.notifications.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        this.updateUnreadCount();
      },
      error: (err) => console.error('Navbar data error:', err),
    });
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
    /* collect message IDs that are still unread */
    const unreadIds = this.notifications
      .filter((n) => !n.read && n.id) // keep only unread with a valid id
      .map((n) => n.id as string);

    if (unreadIds.length === 0) {
      return;
    }

    /* optimistic update in the UI */
    this.notifications.forEach((n) => (n.read = true));
    this.updateUnreadCount(); // shows 0 immediately

    /* call the backend for each ID */
    forkJoin(
      unreadIds.map((id) => this.supportService.markAsRead(id))
    ).subscribe({
      next: () => {
        // all good – nothing else to do (UI already updated)
      },
      error: (err) => {
        console.error('Failed to mark messages as read:', err);
        /* optional rollback UI state if you want */
      },
    });
  }

  updateUnreadCount(): void {
    this.unreadNotifications = this.notifications.filter((n) => !n.read).length;
  }

  logout(): void {
    this.userService.logoutUser();
    this.router.navigate(['/guest/home-content']);
  }
}
