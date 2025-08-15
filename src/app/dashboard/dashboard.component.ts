import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { SystemInfoService } from '../services/system-info.service';
import { Router } from '@angular/router';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { TranslocoDirective } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, TranslocoDirective, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private systemInfoService: SystemInfoService
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  testSystemInfo() {
    console.log('Testing SystemInfo endpoint...');
    this.systemInfoService.getSystemInfo().subscribe({
      next: (response) => {
        console.log('SystemInfo call successful:', response);
      },
      error: (error) => {
        console.error('SystemInfo call failed:', error);
      },
    });
  }

  testLanguageSettings() {
    console.log('Testing Language Settings...');
    this.systemInfoService.getUserLanguageSettings().subscribe({
      next: (response) => {
        console.log('Language Settings call successful:', response);
      },
      error: (error) => {
        console.error('Language Settings call failed:', error);
      },
    });
  }
}
