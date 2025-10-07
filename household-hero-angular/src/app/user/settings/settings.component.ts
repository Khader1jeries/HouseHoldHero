import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  saveSystemPreferences() {
    throw new Error('Method not implemented.');
  }
  userData: any = null;

  // Active settings tab
  activeTab: 'profile' | 'account' = 'profile';
  selectedTheme: string = 'light';

  // Success/error messages
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }
  private loadCurrentUser(): void {
    const email = sessionStorage.getItem('adminEmail');
    if (!email) {
      console.error('No adminEmail in sessionStorage');
      return;
    }

    this.userService.getCurrentUser(email).subscribe({
      next: (user) => (this.userData = user),
      error: (err) => console.error('Failed to load user:', err),
    });
  }
  // Switch between settings tabs
  setActiveTab(tab: 'profile' | 'account'): void {
    this.activeTab = tab;
    // Clear any messages when switching tabs
    this.successMessage = null;
    this.errorMessage = null;
  }

  // Save profile settings
  saveProfile(): void {
    if (!this.userData || !this.userData.email) {
      console.error('User data or email is missing');
      return;
    }

    this.userService.updateUserProfile(this.userData).subscribe({
      next: (res) => {
        // Optionally show a success message
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        // Optionally show an error message
      },
    });
  }

  // Helper: Show success message
  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;

    // Clear success message after 5 seconds
    setTimeout(() => {
      this.successMessage = null;
    }, 5000);
  }

  // Helper: Show error message
  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = null;
  }
  formatDateReadable(dateString: string): string {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short', // e.g. Mon
      year: 'numeric',
      month: 'long', // e.g. June
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24-hour format; change to true for AM/PM
    };

    return date.toLocaleString('en-US', options);
  }

  // Logout
  logout(): void {
    this.userService.logoutUser();
    this.router.navigate(['/guest/login']);
  }
  deleteAccount(): void {
    const email = this.userData?.email || localStorage.getItem('adminEmail');

    if (!email) {
      console.error('User email not found');
      return;
    }

    const input = prompt('Type "delete" to confirm account deletion:');

    if (input?.trim().toLowerCase() === 'delete') {
      this.userService.deleteUser(email).subscribe({
        next: (res) => {
          console.log(res.message);
          alert('Your account has been deleted.');
          // Optional: redirect to login or home
        },
        error: (err) => {
          console.error('Error deleting account:', err);
          alert('An error occurred while deleting your account.');
        },
      });
    } else {
      alert('Account deletion cancelled or incorrect confirmation.');
    }
  }
}
