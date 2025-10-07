import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-service',
  standalone: true,
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.css'
})
export class TermsServiceComponent {
  lastUpdated: string = 'April 29, 2025';
}