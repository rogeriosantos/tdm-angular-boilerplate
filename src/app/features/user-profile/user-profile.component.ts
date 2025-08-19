import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';

import { selectUserProfileViewModel } from './state/user-profile.selectors';
import { I18nService } from '../i18n/services/i18n.service';
import { SupportedLanguage, supportedLanguages } from '../i18n/state/i18n.state';
import * as UserProfileActions from './state/user-profile.actions';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
  private store = inject(Store);
  private i18nService = inject(I18nService);

  protected vm$ = this.store.select(selectUserProfileViewModel);
  protected supportedLanguages = supportedLanguages;

  ngOnInit() {
    // Load user profile on component init
    this.store.dispatch(UserProfileActions.loadUserProfile());
  }

  onLanguageChange(language: SupportedLanguage) {
    this.i18nService.setBothLanguages(language);
  }

  refreshUserProfile() {
    this.store.dispatch(UserProfileActions.loadUserProfile());
  }
}
