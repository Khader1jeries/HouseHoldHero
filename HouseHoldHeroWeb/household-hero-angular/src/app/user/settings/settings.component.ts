import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

interface ThemeSetting {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
}

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
  activeTab: 'profile' | 'appearance' | 'account' = 'profile';
  selectedTheme: string = 'default';
  availableThemes: ThemeSetting[] = [];
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
  setActiveTab(tab: 'profile' | 'appearance' | 'account'): void {
    this.activeTab = tab;
    // Clear any messages when switching tabs
    this.successMessage = null;
    this.errorMessage = null;
  }

  // Upload profile picture (mock function)
  uploadProfilePicture(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // In a real app, this would upload the file to a server
      console.log('Uploading file:', file.name);

      // Mock success after a delay
      setTimeout(() => {
        // Mock a new profile picture URL
        //this.profile.profilePicture = 'assets/profile_pic.png'; // In a real app, this would be the new URL
        this.showSuccess('Profile picture updated successfully');
      }, 1500);
    }
  }

  // Save profile settings
  saveProfile(): void {
    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('Profile information updated successfully');
    }, 1000);
  }

  // Apply theme
  applyTheme(themeId: string): void {
    this.selectedTheme = themeId;

    // In a real app, this would update the application theme
    console.log('Applying theme:', themeId);

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('Theme applied successfully');
    }, 500);
  }

  // Save appearance settings
  saveAppearanceSettings(): void {
    // In a real app, this would call an API
    console.log('Saving appearance settings:', {
      theme: this.selectedTheme,
    });

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('Appearance settings updated successfully');
    }, 1000);
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

  // Logout
  logout(): void {
    // Navigate to login page
    this.router.navigate(['/guest/login']);
  }
}
