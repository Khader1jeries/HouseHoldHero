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

  // Modal properties
  showModal: boolean = false;
  modalTitle: string = '';
  selectedChart: string = '';
  selectedChartType: 'item-details' | 'chart-overview' = 'chart-overview';
  selectedItem: any = null;

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

  // Interactive chart methods
  showChartDetails(chartType: string): void {
    this.selectedChartType = 'chart-overview';
    this.selectedChart = chartType;

    switch (chartType) {
      case 'points-by-member':
        this.modalTitle = 'Points by Member - Overview';
        break;
      case 'tasks-by-category':
        this.modalTitle = 'Tasks by Category - Overview';
        break;
      case 'tasks-by-status':
        this.modalTitle = 'Tasks by Status - Overview';
        break;
      case 'points-over-time':
        this.modalTitle = 'Points Over Time - Overview';
        break;
      case 'tasks-created':
        this.modalTitle = 'Tasks Created Over Time - Overview';
        break;
    }

    this.showModal = true;
  }

  showItemDetails(item: any, chartType: string, event: Event): void {
    // Prevent the click from propagating to parent elements
    event.stopPropagation();

    this.selectedChartType = 'item-details';
    this.selectedChart = chartType;
    this.selectedItem = item;

    switch (chartType) {
      case 'points-by-member':
        this.modalTitle = `Member Details: ${item.name}`;
        break;
      case 'tasks-by-category':
        this.modalTitle = `Category Details: ${item.name}`;
        break;
      case 'tasks-by-status':
        this.modalTitle = `Status Details: ${item.name}`;
        break;
      case 'points-over-time':
      case 'tasks-created':
        this.modalTitle = `${item.name} Details`;
        break;
    }

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  // Helper methods for chart calculations
  getTotalPoints(): number {
    return this.pointsByMember.reduce((sum, item) => sum + item.value, 0);
  }

  getTotalTasks(): number {
    return this.tasksByStatus.reduce((sum, item) => sum + item.value, 0);
  }

  getPercentageOfTotal(value: number, total: number): number {
    return Math.round((value / total) * 100);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getCurrentDate(): Date {
    return new Date();
  }

  getTopPerformer(): string {
    const sorted = [...this.pointsByMember].sort((a, b) => b.value - a.value);
    return sorted.length > 0 ? sorted[0].name : 'None';
  }

  getMostCommonCategory(): string {
    const sorted = [...this.taskCompletionByCategory].sort(
      (a, b) => b.value - a.value
    );
    return sorted.length > 0 ? sorted[0].name : 'None';
  }

  getCompletionRate(): number {
    const completedTasks =
      this.tasksByStatus.find((item) => item.name === 'Completed')?.value || 0;
    const totalTasks = this.getTotalTasks();
    return Math.round((completedTasks / totalTasks) * 100);
  }

  getOverdueTasks(): number {
    return (
      this.tasksByStatus.find((item) => item.name === 'Overdue')?.value || 0
    );
  }

  getTotalPointsOverTime(): number {
    return this.pointsOverTime.reduce((sum, item) => sum + item.value, 0);
  }

  getAverageMonthlyPoints(): number {
    const total = this.getTotalPointsOverTime();
    return Math.round(total / this.pointsOverTime.length);
  }

  getPointsTrend(): string {
    if (this.pointsOverTime.length < 2) return 'Stable';

    const first = this.pointsOverTime[0].value;
    const last = this.pointsOverTime[this.pointsOverTime.length - 1].value;

    if (last > first * 1.1) return 'Increasing';
    if (last < first * 0.9) return 'Decreasing';
    return 'Stable';
  }

  getTotalTasksCreated(): number {
    return this.taskCreationOverTime.reduce((sum, item) => sum + item.value, 0);
  }

  getAverageMonthlyTasks(): number {
    const total = this.getTotalTasksCreated();
    return Math.round(total / this.taskCreationOverTime.length);
  }

  getTasksTrend(): string {
    if (this.taskCreationOverTime.length < 2) return 'Stable';

    const first = this.taskCreationOverTime[0].value;
    const last =
      this.taskCreationOverTime[this.taskCreationOverTime.length - 1].value;

    if (last > first * 1.1) return 'Increasing';
    if (last < first * 0.9) return 'Decreasing';
    return 'Stable';
  }

  getAveragePointsPerTask(category: string): number {
    // In a real app, this would calculate based on real data
    // For mock purposes, generate a reasonable value
    const basePoints = 50;

    switch (category) {
      case 'Cleaning':
        return basePoints * 1.2;
      case 'Cooking':
        return basePoints * 1.5;
      case 'Maintenance':
        return basePoints * 2;
      case 'Shopping':
        return basePoints * 0.8;
      default:
        return basePoints;
    }
  }
}
