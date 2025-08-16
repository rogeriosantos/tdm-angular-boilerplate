import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { SystemInfoService } from '../services/system-info.service';
import { UserProfileService } from '../services/user-profile.service';
import { SystemInfo } from '../models/system-info.model';
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
    private systemInfoService: SystemInfoService,
    private userProfileService: UserProfileService
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  testSystemInfo() {
    console.log('Testing SystemInfo endpoint...');
    this.systemInfoService.getSystemInfo().subscribe({
      next: (response: SystemInfo) => {
        console.log('SystemInfo call successful:', response);
      },
      error: (error: any) => {
        console.error('SystemInfo call failed:', error);
      },
    });
  }

  testLanguageSettings() {
    console.log('Testing Language Settings...');
    this.systemInfoService.getUserLanguageSettings().subscribe({
      next: (response: { uiLanguage: string; dataLanguage: string }) => {
        console.log('Language Settings call successful:', response);
      },
      error: (error: any) => {
        console.error('Language Settings call failed:', error);
      },
    });
  }

  testUserProfileLocale() {
    console.log('🌍 Testing User Profile Locale Settings...');
    this.userProfileService.getUserLanguageSettings().subscribe({
      next: (response: { uiLanguage: string; dataLanguage: string }) => {
        console.log('✅ User Profile Locale Settings:', response);
        console.log('🎯 This will be used for i18n language selection');
      },
      error: (error: any) => {
        console.error('❌ User Profile Locale Settings failed:', error);
      },
    });
  }
}
