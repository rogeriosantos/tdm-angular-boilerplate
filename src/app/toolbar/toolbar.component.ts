import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { I18nService } from '../i18n/services/i18n.service';
import { SupportedLanguage } from '../i18n/state/i18n.state';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    TranslocoDirective,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnInit {
  appName = 'Global Line';
  moduleName = 'CRIB Management';

  // Real user data from user profile service
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // For backward compatibility with template - but now shows real status
  get currentUser() {
    const user = this.currentUserSubject.value;
    if (!user) {
      return { username: '❌ API ERROR' }; // Show clear error instead of "Loading..."
    }
    return user;
  }

  currentLanguage$: Observable<string>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private translocoService: TranslocoService,
    private i18nService: I18nService
  ) {
    this.currentLanguage$ = this.translocoService.langChanges$;
  }

  ngOnInit() {
    // Load actual user profile data
    this.loadUserProfile();
  }

  private loadUserProfile() {
    console.log('🔄 Toolbar: Loading user profile...');
    this.userProfileService.getUserInfo().subscribe({
      next: (userProfile) => {
        console.log('✅ Toolbar: User profile loaded:', userProfile);
        this.currentUserSubject.next(userProfile);
      },
      error: (error) => {
        console.error('❌ Toolbar: Failed to load user profile:', error);
        console.error('❌ Toolbar: NO MOCK DATA - User profile service is failing');

        // Don't set any fallback data - let the error be visible
        this.currentUserSubject.next(null);
      },
    });
  }

  navigateToHome() {
    // Navigate to dashboard or home page
    this.router.navigate(['/dashboard']);
  }

  changeLanguage(language: SupportedLanguage) {
    // Use the new I18n service to change both UI and data language
    this.i18nService.setBothLanguages(language);
  }

  logout() {
    // Call logout which handles everything internally
    this.authService.logout();
    // Navigate to login after logout
    this.router.navigate(['/login']);
  }

  cleanupCookies() {
    // Clean up any local storage or session data
  }
}
