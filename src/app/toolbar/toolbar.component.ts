import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { I18nService } from '../i18n/services/i18n.service';
import { SupportedLanguage } from '../i18n/state/i18n.state';
import { Observable } from 'rxjs';

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
  moduleName = '';

  // Mock user data - in real app this would come from a service
  currentUser = {
    username: 'SYSADMIN',
  };

  currentLanguage$: Observable<string>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private translocoService: TranslocoService,
    private i18nService: I18nService
  ) {
    this.currentLanguage$ = this.translocoService.langChanges$;
  }

  ngOnInit() {
    // Set module name using translation like machine-operator
    this.moduleName = this.translocoService.translate('main.module-name');
  }

  navigateToHome() {
    // Navigate to dashboard or home page
    this.router.navigate(['/dashboard']);
  }

  changeLanguage(language: SupportedLanguage) {
    // Use the new I18n service to change both UI and data language
    this.i18nService.setBothLanguages(language);
  }

  refreshServerLanguageSettings() {
    // Fetch fresh language settings from the server
    this.i18nService.fetchServerLanguageSettings();
  }

  logout() {
    // Call logout which handles everything internally
    this.authService.logout();
    // Navigate to login after logout
    this.router.navigate(['/login']);
  }

  cleanupCookies() {
    // Clean up any local storage or session data
    localStorage.removeItem('selectedMachine');
    localStorage.removeItem('selectedJob');
  }
}
