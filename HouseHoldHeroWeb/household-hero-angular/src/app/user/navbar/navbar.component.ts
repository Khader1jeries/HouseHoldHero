import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  imports: [SidebarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  sidebarStatus: number = 0;

  toggleSidebarStatus(): void {
    this.sidebarStatus = this.sidebarStatus === 0 ? 1 : 0;
  }
}
