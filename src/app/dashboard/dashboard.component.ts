import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';
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
  uilanguage: string = '';
  dataLanguage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private userProfileService: UserProfileService
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  testUserProfileLocale() {
    console.log('🌍 Testing User Profile Locale Settings...');
    this.userProfileService.getUserLanguageSettings().subscribe({
      next: (response: { uiLanguage: string; dataLanguage: string }) => {
        console.log('✅ User Profile Locale Settings:', response);

        this.uilanguage = response.uiLanguage;
        this.dataLanguage = response.dataLanguage;

        console.log('🎯 This will be used for i18n language selection');
      },
      error: (error: any) => {
        console.error('❌ User Profile Locale Settings failed:', error);
      },
    });
  }
}
