import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ReportFormat {
  id: string;
  name: string;
  extension: string;
  icon: string;
}

interface DateRange {
  start: Date;
  end: Date;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent implements OnInit {
  // Available report types
  reportTypes: ReportType[] = [
    {
      id: 'family-summary',
      name: 'Family Summary',
      description: 'Overview of all family members, their tasks, and points',
      icon: 'bi-people-fill',
    },
    {
      id: 'task-completion',
      name: 'Task Completion',
      description: 'Detailed report of completed tasks with metrics',
      icon: 'bi-check-circle-fill',
    },
    {
      id: 'point-distribution',
      name: 'Point Distribution',
      description: 'Analysis of point distribution across family members',
      icon: 'bi-trophy-fill',
    },
    {
      id: 'performance-metrics',
      name: 'Performance Metrics',
      description: 'Key performance indicators for task management',
      icon: 'bi-graph-up',
    },
    {
      id: 'custom',
      name: 'Custom Report',
      description: 'Build a custom report with selected metrics',
      icon: 'bi-gear-fill',
    },
  ];

  // Available export formats
  exportFormats: ReportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF Document',
      extension: '.pdf',
      icon: 'bi-file-earmark-pdf',
    },
    {
      id: 'excel',
      name: 'Excel Spreadsheet',
      extension: '.xlsx',
      icon: 'bi-file-earmark-excel',
    },
    {
      id: 'csv',
      name: 'CSV File',
      extension: '.csv',
      icon: 'bi-file-earmark-spreadsheet',
    },
    {
      id: 'json',
      name: 'JSON Data',
      extension: '.json',
      icon: 'bi-file-earmark-code',
    },
  ];

  // Report configuration
  selectedReportType: string = 'family-summary';
  selectedFormat: string = 'pdf';
  dateRange: DateRange = {
    start: new Date(),
    end: new Date(),
  };
  includeCharts: boolean = true;
  includeTables: boolean = true;
  includeMetrics: boolean = true;

  // Custom report options
  customOptions = {
    includeFamilyMembers: true,
    includeActiveTasks: true,
    includeCompletedTasks: true,
    includePointHistory: true,
    includePerformanceMetrics: true,
  };

  // Report generation status
  isGenerating: boolean = false;
  generatedReportUrl: string | null = null;
  errorMessage: string | null = null;

  constructor() {}

  ngOnInit(): void {
    // Initialize date range to current month
    const today = new Date();
    this.dateRange.start = new Date(today.getFullYear(), today.getMonth(), 1);
    this.dateRange.end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  // Set predefined date ranges
  setDateRange(range: 'week' | 'month' | 'quarter' | 'year'): void {
    const today = new Date();

    switch (range) {
      case 'week':
        // Current week (Sunday to Saturday)
        const day = today.getDay();
        const diff = today.getDate() - day;
        this.dateRange.start = new Date(today.setDate(diff));
        this.dateRange.end = new Date(today);
        this.dateRange.end.setDate(this.dateRange.start.getDate() + 6);
        break;

      case 'month':
        // Current month
        this.dateRange.start = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        this.dateRange.end = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        break;

      case 'quarter':
        // Current quarter
        const quarter = Math.floor(today.getMonth() / 3);
        this.dateRange.start = new Date(today.getFullYear(), quarter * 3, 1);
        this.dateRange.end = new Date(
          today.getFullYear(),
          (quarter + 1) * 3,
          0
        );
        break;

      case 'year':
        // Current year
        this.dateRange.start = new Date(today.getFullYear(), 0, 1);
        this.dateRange.end = new Date(today.getFullYear(), 11, 31);
        break;
    }
  }

  // Handle report type selection
  onReportTypeChange(): void {
    // Reset custom options if not using custom report
    if (this.selectedReportType !== 'custom') {
      this.resetCustomOptions();
    }
  }

  // Reset custom report options to defaults
  resetCustomOptions(): void {
    this.customOptions = {
      includeFamilyMembers: true,
      includeActiveTasks: true,
      includeCompletedTasks: true,
      includePointHistory: true,
      includePerformanceMetrics: true,
    };
  }

  // Generate report
  generateReport(): void {
    this.isGenerating = true;
    this.generatedReportUrl = null;
    this.errorMessage = null;

    // Simulate API call to generate report
    setTimeout(() => {
      // In a real application, this would be an API call
      try {
        console.log('Generating report with these options:', {
          type: this.selectedReportType,
          format: this.selectedFormat,
          dateRange: this.dateRange,
          includeCharts: this.includeCharts,
          includeTables: this.includeTables,
          includeMetrics: this.includeMetrics,
          customOptions: this.customOptions,
        });

        // Simulate success
        this.isGenerating = false;
        const format = this.exportFormats.find(
          (f) => f.id === this.selectedFormat
        );
        const extension = format ? format.extension : '.pdf';
        this.generatedReportUrl = `household-hero-report-${new Date().getTime()}${extension}`;
      } catch (error) {
        // Simulate error
        this.isGenerating = false;
        this.errorMessage = 'Failed to generate report. Please try again.';
        console.error('Error generating report:', error);
      }
    }, 2500); // Simulate delay
  }

  // Convert date to ISO string for date inputs
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Handle start date change
  onStartDateChange(event: any): void {
    const value = event.target.value;
    if (value) {
      this.dateRange.start = new Date(value);
    }
  }

  // Handle end date change
  onEndDateChange(event: any): void {
    const value = event.target.value;
    if (value) {
      this.dateRange.end = new Date(value);
    }
  }

  // Download the generated report
  downloadReport(): void {
    if (this.generatedReportUrl) {
      // In a real application, this would download the file
      console.log('Downloading report:', this.generatedReportUrl);

      // Show alert for demo purposes
      alert(`Report download started: ${this.generatedReportUrl}`);
    }
  }
}
