import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { P1Service } from '../services/p1.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  data: any;
  private sub?: Subscription;
  private powerChart: any;
  private phaseChart: any;
  private maxHistory = 60;
  private powerLabels: string[] = [];
  private powerTotal: number[] = [];
  private powerL1: number[] = [];
  private powerL2: number[] = [];
  private powerL3: number[] = [];
  private chartReady = false;

  @ViewChild('powerCanvas', { static: true }) powerCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('phaseCanvas', { static: true }) phaseCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private p1: P1Service,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.initCharts();
    this.sub = this.p1.streamData().subscribe({
      next: (d) => {
        this.data = d;
        this.cdr.detectChanges();
        if (this.chartReady) {
          this.updateCharts(d);
        }
      },
      error: (err) => console.error('Error fetching data', err),
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.powerChart?.destroy();
    this.phaseChart?.destroy();
  }

  private async initCharts() {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    this.powerChart = new Chart(this.powerCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.powerLabels,
        datasets: [
          {
            label: 'Total',
            data: this.powerTotal,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
          {
            label: 'L1',
            data: this.powerL1,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          },
          {
            label: 'L2',
            data: this.powerL2,
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          },
          {
            label: 'L3',
            data: this.powerL3,
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: { display: false },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#94a3b8', callback: (v) => v + ' W' },
          },
        },
        plugins: {
          legend: { labels: { color: '#94a3b8', usePointStyle: true, pointStyle: 'circle' } },
        },
      },
    });

    this.phaseChart = new Chart(this.phaseCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['L1', 'L2', 'L3'],
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { labels: { color: '#94a3b8', usePointStyle: true, pointStyle: 'circle' } },
        },
      },
    });

    this.chartReady = true;
  }

  private updateCharts(d: any) {
    const now = new Date().toLocaleTimeString();
    this.powerLabels.push(now);
    this.powerTotal.push(d.active_power_w ?? 0);
    this.powerL1.push(d.active_power_l1_w ?? 0);
    this.powerL2.push(d.active_power_l2_w ?? 0);
    this.powerL3.push(d.active_power_l3_w ?? 0);

    if (this.powerLabels.length > this.maxHistory) {
      this.powerLabels.shift();
      this.powerTotal.shift();
      this.powerL1.shift();
      this.powerL2.shift();
      this.powerL3.shift();
    }
    this.powerChart?.update();

    if (this.phaseChart) {
      this.phaseChart.data.datasets[0].data = [
        d.active_power_l1_w ?? 0,
        d.active_power_l2_w ?? 0,
        d.active_power_l3_w ?? 0,
      ];
      this.phaseChart.update();
    }
  }
}
