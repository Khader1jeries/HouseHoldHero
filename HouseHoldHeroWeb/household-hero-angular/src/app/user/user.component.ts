// src/app/user/user.component.ts - Updated to handle URL-based family ID
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Listen for query parameter changes
    this.route.queryParams.subscribe((params) => {
      const familyIdFromUrl = params['familyId'];
      const currentUser = this.userService.getCurrentUser();

      if (familyIdFromUrl && currentUser) {
        // Update user data with family ID from URL if it's different
        if (currentUser.email !== familyIdFromUrl) {
          this.userService.setCurrentUser({
            ...currentUser,
            email: familyIdFromUrl,
          });
        }
      } else if (currentUser?.email && !familyIdFromUrl) {
        // If user has family ID but URL doesn't, add it to URL
        this.userService.ensureFamilyIdInUrl(currentUser.email);
      }
    });

    // Ensure family ID is in URL on component initialization
    const currentUser = this.userService.getCurrentUser();
    if (currentUser?.email) {
      this.userService.ensureFamilyIdInUrl(currentUser.email);
    }
  }
}
