import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserProfile } from '../../shared/models/user-profile.model';
import { environment } from '../config/environment';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = environment.baseApiUrl;

  getUserInfo(): Observable<UserProfile> {
    // Try the OAuth2 identity endpoint first, fallback to API endpoint if needed
    return this.http.get<any>(`${this.apiUrl}/identity/connect/userinfo`).pipe(
      tap((userInfo) => {
        console.log('=== UserInfo API Response (OAuth2 Identity) ===');
        console.log('Full Response:', userInfo);
        console.log('Username:', userInfo.preferred_username || userInfo.name);
        console.log('Locale:', userInfo.locale);
        console.log('Department:', userInfo.department);
        console.log('===============================================');
      }),
      map((userInfo) => ({
        username: userInfo.preferred_username || userInfo.name || 'Unknown',
        department: userInfo.department || 'Unknown Department',
        email: userInfo.email,
        picture: userInfo.picture,
        locale: userInfo.locale || 'en-US',
        data_language: userInfo.data_language || userInfo.locale || 'en-US',
      })),
      catchError((error) => {
        console.error('❌ Failed to fetch user info:', error);
        console.error('❌ UserInfo API is not working - NO MOCK DATA PROVIDED');

        // Don't provide fallback data - let the error propagate
        throw error;
      })
    );
  }

  getUserLanguageSettings(): Observable<{ uiLanguage: string; dataLanguage: string }> {
    return this.getUserInfo().pipe(
      map((userProfile) => {
        const uiLanguage = this.convertToSupportedLanguage(userProfile.locale || 'en-US');
        const dataLanguage = this.convertToSupportedLanguage(userProfile.data_language || 'en-US');

        console.log('=== User Profile Language Conversion ===');
        console.log('Original UI Language:', userProfile.locale, '-> Converted:', uiLanguage);
        console.log(
          'Original Data Language:',
          userProfile.data_language,
          '-> Converted:',
          dataLanguage
        );
        console.log('========================================');

        return {
          uiLanguage,
          dataLanguage,
        };
      })
    );
  }

  private convertToSupportedLanguage(language: string): string {
    // Convert full locale to supported language code
    if (language.startsWith('en')) return 'en';
    if (language.startsWith('de')) return 'de';
    // Add more languages as needed
    console.warn(`⚠️ Unsupported language: ${language}, falling back to 'en'`);
    return 'en'; // fallback to English
  }
}
