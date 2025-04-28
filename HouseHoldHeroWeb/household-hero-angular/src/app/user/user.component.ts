import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { IndexComponent } from './index/index.component';

@Component({
  selector: 'app-user',
  imports: [NavbarComponent, IndexComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {}
