import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { DataService } from './services/data.service';
@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Load data when app initializes
    this.dataService.loadInitialData();
  }
}
