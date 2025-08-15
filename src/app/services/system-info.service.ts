import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SystemInfo } from '../models/system-info.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SystemInfoService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl || 'https://pw-gkyr1t3/202501HF01local';

  getSystemInfo(): Observable<SystemInfo> {
    return this.http.get<SystemInfo>(`${this.apiUrl}/api/System/SystemInfo`).pipe(
      tap((systemInfo) => {
        console.log('=== SystemInfo API Response ===');
        console.log('Full Response:', systemInfo);
        console.log('User ID:', systemInfo.userId);
        console.log('Language:', systemInfo.language);
        console.log('Data Language:', systemInfo.dataLanguage);
        console.log('Server URL:', systemInfo.serverUrl);
        console.log('================================');
      }),
      catchError((error) => {
        console.warn('Failed to fetch system info:', error);
        // Return fallback system info
        return of({
          userId: 'UNKNOWN',
          language: 'en-US',
          dataLanguage: 'en-US',
          connectionString: '',
          providerName: '',
          dataBaseVersion: '',
          additionalDataBaseInfo: {
            buildClrVersion: '',
            collation: '',
            edition: '',
            engineEdition: '',
            instanceName: '',
            isSingleUser: '',
            machineName: '',
            productVersion: '',
            serverName: '',
            sqlCharSetName: '',
            sqlSortOrderName: '',
          },
          dataSource: '',
          initialCatalog: '',
          hotfix: '',
          hotfixVersion: 0,
          baseSystemHotfix: '',
          baseSystemHotfixVersion: 0,
          fileVersion: '',
          applicationFolder: '',
          cadDestination: '',
          cachedAssetsFolder: '',
          cachedDataImportsFolder: '',
          fileCreationTimeUtc: '',
          serverUrl: '',
          dataSetup: 0,
        });
      })
    );
  }

  getUserLanguageSettings(): Observable<{ uiLanguage: string; dataLanguage: string }> {
    return this.getSystemInfo().pipe(
      map((systemInfo) => {
        const uiLanguage = this.convertToSupportedLanguage(systemInfo.language);
        const dataLanguage = this.convertToSupportedLanguage(systemInfo.dataLanguage);

        console.log('=== Language Conversion ===');
        console.log('Original UI Language:', systemInfo.language, '-> Converted:', uiLanguage);
        console.log(
          'Original Data Language:',
          systemInfo.dataLanguage,
          '-> Converted:',
          dataLanguage
        );
        console.log('===========================');

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
    return 'en'; // fallback
  }
}
