import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ChartData {
  name: string;
  value: number;
}

interface LineChartData {
  name: string;
  value: number;
  date: Date;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit {
  // Task completion data
  taskCompletionByMember: ChartData[] = [];
  taskCompletionByCategory: ChartData[] = [];

  // Points data
  pointsByMember: ChartData[] = [];
  pointsOverTime: LineChartData[] = [];

  // Tasks data
  tasksByDifficulty: ChartData[] = [];
  tasksByStatus: ChartData[] = [];
  taskCreationOverTime: LineChartData[] = [];

  // Performance metrics
  averageCompletionTime: number = 0;
  onTimeCompletionRate: number = 0;
  taskDistributionBalance: number = 0; // 0-100%, where 100% means perfectly balanced

  // Time period selector
  selectedPeriod: 'week' | 'month' | 'quarter' | 'year' = 'month';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In a real application, this data would come from a service
    // Here we're using mock data for demonstration
    this.generateMockData();
    this.calculatePerformanceMetrics();
  }

  generateMockData(): void {
    // Task completion by member
    this.taskCompletionByMember = [
      { name: 'John', value: 15 },
      { name: 'Kavin', value: 22 },
      { name: 'Sarah', value: 18 },
    ];

    // Task completion by category
    this.taskCompletionByCategory = [
      { name: 'Cleaning', value: 28 },
      { name: 'Cooking', value: 12 },
      { name: 'Maintenance', value: 8 },
      { name: 'Shopping', value: 7 },
    ];

    // Points by member
    this.pointsByMember = [
      { name: 'John', value: 1500 },
      { name: 'Kavin', value: 2200 },
      { name: 'Sarah', value: 1800 },
    ];

    // Points over time (last 6 months)
    const today = new Date();
    this.pointsOverTime = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(today);
      date.setMonth(today.getMonth() - 5 + i);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        value: 1000 + Math.floor(Math.random() * 1500),
        date: date,
      };
    });

    // Tasks by difficulty
    this.tasksByDifficulty = [
      { name: 'Easy', value: 35 },
      { name: 'Medium', value: 25 },
      { name: 'Hard', value: 10 },
    ];

    // Tasks by status
    this.tasksByStatus = [
      { name: 'Completed', value: 55 },
      { name: 'In Progress', value: 20 },
      { name: 'Overdue', value: 8 },
      { name: 'Upcoming', value: 12 },
    ];

    // Task creation over time (last 6 months)
    this.taskCreationOverTime = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(today);
      date.setMonth(today.getMonth() - 5 + i);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        value: 10 + Math.floor(Math.random() * 20),
        date: date,
      };
    });
  }

  calculatePerformanceMetrics(): void {
    // Average completion time (in hours)
    this.averageCompletionTime = 12.5;

    // On-time completion rate (percentage)
    this.onTimeCompletionRate = 87.3;

    // Task distribution balance (percentage)
    this.taskDistributionBalance = 81.2;
  }

  changePeriod(period: 'week' | 'month' | 'quarter' | 'year'): void {
    this.selectedPeriod = period;
    // In a real app, you would refresh the data based on the selected period
    this.generateMockData();
    this.calculatePerformanceMetrics();
  }

  navigateToReports(): void {
    this.router.navigate(['/user/reports']);
  }
}
