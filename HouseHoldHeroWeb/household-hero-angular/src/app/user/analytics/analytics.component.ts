import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

interface ChartData {
  label: string;
  value: number;
}

interface LineChartData {
  label: string; // like "2025-07"
  value: number; // score or count
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit {
  onTimeCompletionRate: number = 0;
  taskDistributionBalance: number = 0;
  tasksByStatus: ChartData[] = [];
  taskCreationOverTime: LineChartData[] = [];
  pointsByMember: ChartData[] = [];
  pointsOverTime: LineChartData[] = [];
  membersPerformance: {
    fullName: string;
    completedTasks: number;
    score: number;
    completionRate: number;
  }[] = [];

  // Modal properties
  showModal: boolean = false;
  modalTitle: string = '';
  selectedChart: string = '';
  selectedChartType: 'item-details' | 'chart-overview' = 'chart-overview';
  selectedItem: any = null;
  averageCompletionTime: number = -1;

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }
  loadAnalyticsData(): void {
    const adminEmail = sessionStorage.getItem('adminEmail');
    if (!adminEmail) {
      console.error('Admin email not found');
      return;
    }

    // 1. On-time completion %
    this.analyticsService.getOnTimeCompletion(adminEmail).subscribe({
      next: (rate) => (this.onTimeCompletionRate = rate),
      error: (err) => console.error('❌ On-time completion error:', err),
    });

    // 2. Task distribution balance %
    this.analyticsService.getTaskDistribution(adminEmail).subscribe({
      next: (balance) => (this.taskDistributionBalance = balance),
      error: (err) => console.error('❌ Task distribution error:', err),
    });

    // 3. Tasks by status (bar or pie chart)
    this.analyticsService.getTasksByStatus(adminEmail).subscribe({
      next: (statusData) => {
        this.tasksByStatus = [
          { label: 'Completed', value: statusData.completed },
          { label: 'In Progress', value: statusData.inProgress },
          { label: 'Overdue', value: statusData.overDue },
          { label: 'Upcoming', value: statusData.upcoming },
        ];
      },
      error: (err) => console.error('❌ Tasks by status error:', err),
    });

    // 4. Points by member (bar chart)
    this.analyticsService.getPointsByMember(adminEmail).subscribe({
      next: (points) => {
        this.pointsByMember = Object.entries(points).map(([label, value]) => ({
          label,
          value,
        }));
      },
      error: (err) => console.error('❌ Points by member error:', err),
    });

    // 5. Points earned over time (line chart)
    this.analyticsService.getPointsEarnedOverTime(adminEmail).subscribe({
      next: (points) => {
        this.pointsOverTime = Object.entries(points).map(([label, value]) => ({
          label,
          value,
        }));
      },
      error: (err) => console.error('❌ Points over time error:', err),
    });

    // 6. Tasks created over time (line chart)
    this.analyticsService.getCreatedOverTime(adminEmail).subscribe({
      next: (counts) => {
        this.taskCreationOverTime = Object.entries(counts).map(
          ([label, value]) => ({
            label,
            value,
          })
        );
      },
      error: (err) => console.error('❌ Created over time error:', err),
    });

    // 7. Member performance
    this.analyticsService.getMemberPerformance(adminEmail).subscribe({
      next: (data) => (this.membersPerformance = data),
      error: (err) => console.error('❌ Member performance error:', err),
    });
  }

  generateReport(): void {
    const adminEmail = sessionStorage.getItem('adminEmail');

    if (!adminEmail) {
      console.error('Admin email not found in local storage');
      return;
    }

    this.analyticsService.downloadPdfReport(adminEmail).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_report_${adminEmail}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to generate or download report:', err);
      },
    });
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
        this.modalTitle = `Member Details: ${item.label}`;
        break;
      case 'tasks-by-category':
        this.modalTitle = `Category Details: ${item.label}`;
        break;
      case 'tasks-by-status':
        this.modalTitle = `Status Details: ${item.label}`;
        break;
      case 'points-over-time':
      case 'tasks-created':
        this.modalTitle = `${item.label} Details`;
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
    return sorted.length > 0 ? sorted[0].label : 'None';
  }

  getCompletionRate(): number {
    const completedTasks =
      this.tasksByStatus.find((item) => item.label === 'Completed')?.value || 0;
    const totalTasks = this.getTotalTasks();
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  getOverdueTasks(): number {
    return (
      this.tasksByStatus.find((item) => item.label === 'Overdue')?.value || 0
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

    if (last > first * 1.1) return 'Decreasing';
    if (last < first * 0.9) return 'Increasing';
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

    if (last > first * 1.1) return 'Decreasing';
    if (last < first * 0.9) return 'Increasing';
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
  formatMonthYear(dateStr: string): string {
    const [year, month] = dateStr.split('-').map(Number);

    const date = new Date(year, month - 1); // JS months are 0-based
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    });

    return formatter.format(date); // e.g. "July 2025"
  }
}
