import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PrivacySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

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
  // Active settings tab
  activeTab:
    | 'profile'
    | 'notifications'
    | 'privacy'
    | 'appearance'
    | 'account' = 'profile';

  // Success/error messages
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Profile settings
  profile = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+972 55-555-5555',
    profilePicture: 'assets/profile_pic.png',
    role: 'Family Admin',
  };

  // Notification settings
  notificationSettings: NotificationSetting[] = [
    {
      id: 'task-assigned',
      name: 'Task Assignments',
      description: 'Receive notifications when new tasks are assigned to you',
      enabled: true,
    },
    {
      id: 'task-completed',
      name: 'Task Completions',
      description: 'Receive notifications when family members complete tasks',
      enabled: true,
    },
    {
      id: 'points-earned',
      name: 'Points Earned',
      description: 'Receive notifications when you earn points',
      enabled: true,
    },
    {
      id: 'leaderboard-updates',
      name: 'Leaderboard Updates',
      description:
        'Receive notifications about changes in the leaderboard standings',
      enabled: false,
    },
    {
      id: 'task-reminders',
      name: 'Task Reminders',
      description: 'Receive reminders about upcoming task deadlines',
      enabled: true,
    },
    {
      id: 'system-announcements',
      name: 'System Announcements',
      description: 'Receive important announcements about the system',
      enabled: true,
    },
  ];

  // Notification channels
  notificationChannels = {
    email: true,
    push: true,
    inApp: true,
  };

  // Privacy settings
  privacySettings: PrivacySetting[] = [
    {
      id: 'show-points',
      name: 'Show My Points',
      description:
        'Allow other family members to see my points on the leaderboard',
      enabled: true,
    },
    {
      id: 'show-tasks',
      name: 'Show My Tasks',
      description: 'Allow other family members to see my active tasks',
      enabled: true,
    },
    {
      id: 'show-stats',
      name: 'Show My Statistics',
      description:
        'Allow other family members to see my performance statistics',
      enabled: true,
    },
    {
      id: 'allow-mentions',
      name: 'Allow Mentions',
      description: 'Allow other family members to mention me in comments',
      enabled: true,
    },
  ];

  // Appearance settings
  selectedTheme: string = 'default';
  availableThemes: ThemeSetting[] = [
    {
      id: 'default',
      name: 'Ocean Teal',
      primaryColor: '#2a9d8f',
      accentColor: '#ff0055',
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      primaryColor: '#121212',
      accentColor: '#bb86fc',
    },
    {
      id: 'light',
      name: 'Light Mode',
      primaryColor: '#f5f5f5',
      accentColor: '#0066cc',
    },
    {
      id: 'nature',
      name: 'Nature Green',
      primaryColor: '#2e7d32',
      accentColor: '#ffc107',
    },
  ];

  // Font size
  fontSize: 'small' | 'medium' | 'large' = 'medium';

  // Account settings
  accountSettings = {
    creationDate: new Date('2023-01-15'),
    lastLogin: new Date('2025-04-28'),
    twoFactorEnabled: false,
  };

  // Deactivation reason
  deactivationReason: string = '';
  deactivationConfirmation: string = '';

  // Language selection
  selectedLanguage: string = 'en';
  availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'he', name: 'עברית' },
    { code: 'ar', name: 'العربية' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Init logic if needed
  }

  // Switch between settings tabs
  setActiveTab(
    tab: 'profile' | 'notifications' | 'privacy' | 'appearance' | 'account'
  ): void {
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
        this.profile.profilePicture = 'assets/profile_pic.png'; // In a real app, this would be the new URL
        this.showSuccess('Profile picture updated successfully');
      }, 1500);
    }
  }

  // Save profile settings
  saveProfile(): void {
    // In a real app, this would call an API
    console.log('Saving profile:', this.profile);

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('Profile information updated successfully');
    }, 1000);
  }

  // Save notification settings
  saveNotificationSettings(): void {
    // In a real app, this would call an API
    console.log('Saving notification settings:', {
      settings: this.notificationSettings,
      channels: this.notificationChannels,
    });

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('Notification settings updated successfully');
    }, 1000);
  }

  // Save privacy settings
  savePrivacySettings(): void {
    // In a real app, this would call an API
    console.log('Saving privacy settings:', this.privacySettings);

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('Privacy settings updated successfully');
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
      fontSize: this.fontSize,
      language: this.selectedLanguage,
    });

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('Appearance settings updated successfully');
    }, 1000);
  }

  // Toggle two-factor authentication
  toggleTwoFactor(): void {
    this.accountSettings.twoFactorEnabled =
      !this.accountSettings.twoFactorEnabled;

    // In a real app, this would call an API to enable/disable 2FA
    console.log(
      'Two-factor authentication:',
      this.accountSettings.twoFactorEnabled ? 'enabled' : 'disabled'
    );

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess(
        `Two-factor authentication ${
          this.accountSettings.twoFactorEnabled ? 'enabled' : 'disabled'
        }`
      );
    }, 1000);
  }

  // Deactivate account
  deactivateAccount(): void {
    // Check confirmation
    if (this.deactivationConfirmation !== 'DEACTIVATE') {
      this.errorMessage =
        'Please type DEACTIVATE to confirm account deactivation';
      return;
    }

    // In a real app, this would call an API to deactivate the account
    console.log('Deactivating account with reason:', this.deactivationReason);

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('Account deactivation request submitted');

      // In a real app, this would log the user out and redirect to the login page
      setTimeout(() => {
        this.router.navigate(['/guest/login']);
      }, 2000);
    }, 1500);
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
    // In a real app, this would call an API to log the user out
    console.log('Logging out');

    // Navigate to login page
    this.router.navigate(['/guest/login']);
  }
  // Save system preferences
  saveSystemPreferences(): void {
    // In a real app, this would call an API
    console.log('Saving system preferences');

    // Mock success after a delay
    setTimeout(() => {
      this.showSuccess('System preferences updated successfully');
    }, 1000);
  }
}
