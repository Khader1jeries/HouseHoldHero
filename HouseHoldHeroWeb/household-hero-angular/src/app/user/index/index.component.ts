import { Component } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  standalone: true,
})
export class IndexComponent {
  goTo(route: string) {
    window.location.href = '/' + route;
    // Or use Angular Router: this.router.navigate([route]);
  }
}
