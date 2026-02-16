import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { environment } from '../../../core/config/environment';
import * as I18nActions from '../../i18n/state/i18n.actions';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  success: boolean;
  message?: string;
  user?: any;
  username?: string;
}

export interface BearerTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Use environment configuration matching machine-operator pattern
  private baseUrl = environment.baseApiUrl;
  // Use separate authentication URL for mixed development environments
  private authBaseUrl = environment.authUrl;
  private tokenUrl = `${this.authBaseUrl}/identity/connect/token`;
  private userInfoUrl = `${this.authBaseUrl}/identity/connect/userinfo`;
  private revokeUrl = `${this.authBaseUrl}/identity/connect/revocation`;

  // OAuth2 Resource Owner configuration (from environment)
  private oauthConfig = environment.oauthConfig;

  private tokenKey = 'auth_token';
  private usernameKey = 'auth_username';
  private tokenExpiresAtKey = 'auth_token_expires_at';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private expirationTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private http: HttpClient,
    private store: Store
  ) {
    // Check if user is already logged in
    const token = this.getToken();
    const username = this.getUsername();
    if (token) {
      if (this.isTokenExpired()) {
        this.clearLocalAuth();
      } else {
        this.currentUserSubject.next({
          token,
          username: username || 'Unknown',
        });
        this.scheduleExpirationRedirect();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 Attempting authentication with URL:', this.tokenUrl);
    console.log('🔐 Login credentials (password hidden):', {
      username: credentials.username,
      password: '***HIDDEN***',
    });

    const payload = this.createRequestOwnerPayload(credentials.username, credentials.password);
    const body = this.mapToAuthPayload(payload);
    const headers = this.createAuthRequestHeader();

    console.log('🔐 Request payload:', {
      ...payload,
      password: '***HIDDEN***',
      client_secret: '***HIDDEN***',
    });
    console.log('🔐 Request body:', body.replace(/password=[^&]*/g, 'password=***HIDDEN***'));
    console.log(
      '🔐 Request headers:',
      headers
        .keys()
        .map(
          (key) => `${key}: ${key.includes('Authorization') ? '***HIDDEN***' : headers.get(key)}`
        )
    );

    return this.http.post<BearerTokenResponse>(this.tokenUrl, body, { headers }).pipe(
      map((response) => {
        console.log('🎉 RAW AUTHENTICATION RESPONSE:', response);
        console.log('🎉 Response details:', {
          access_token: response.access_token
            ? `${response.access_token.substring(0, 20)}...`
            : 'NOT_PROVIDED',
          expires_in: response.expires_in,
          token_type: response.token_type,
          full_response_keys: Object.keys(response),
          full_response: response,
        });

        return {
          access_token: response.access_token,
          expires_in: response.expires_in,
          token_type: response.token_type,
          success: true,
          message: 'Login successful',
          username: credentials.username, // Include the original username
        } as LoginResponse;
      }),
      tap((response) => {
        if (response.success && response.access_token) {
          this.setToken(response.access_token);
          this.setUsername(credentials.username);
          if (response.expires_in) {
            this.setTokenExpiresAt(Date.now() + response.expires_in * 1000);
          }
          this.currentUserSubject.next({
            token: response.access_token,
            username: credentials.username,
          });
          console.log('Authentication successful - token and username stored');
          console.log('Token expires in:', response.expires_in, 'seconds');

          this.scheduleExpirationRedirect();

          // Trigger language settings fetch from user profile
          this.store.dispatch(I18nActions.fetchServerLanguageSettings());
        }
      }),
      catchError((error) => this.handleAuthError(error))
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      // Call server logout if needed
      this.logoutOnServer(token).subscribe({
        next: () => console.log('Server logout successful'),
        error: (error) => console.warn('Server logout failed:', error),
        complete: () => this.clearLocalAuth(),
      });
    } else {
      this.clearLocalAuth();
    }
  }

  private logoutOnServer(accessToken: string): Observable<any> {
    const payload = this.createRevokePayload(accessToken);
    const body = this.mapToAuthPayload(payload);
    const headers = this.createAuthRequestHeader();

    return this.http.post<null>(this.revokeUrl, body, { headers });
  }

  private clearLocalAuth(): void {
    this.clearExpirationTimer();
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.tokenExpiresAtKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
  }

  private setTokenExpiresAt(expiresAtMs: number): void {
    localStorage.setItem(this.tokenExpiresAtKey, expiresAtMs.toString());
  }

  private getTokenExpiresAt(): number | null {
    const val = localStorage.getItem(this.tokenExpiresAtKey);
    return val ? parseInt(val, 10) : null;
  }

  private isTokenExpired(): boolean {
    const expiresAt = this.getTokenExpiresAt();
    if (!expiresAt) return false;
    return Date.now() >= expiresAt;
  }

  private scheduleExpirationRedirect(): void {
    this.clearExpirationTimer();
    const expiresAt = this.getTokenExpiresAt();
    if (!expiresAt) return;

    const msUntilExpiry = expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      this.onTokenExpired();
      return;
    }

    console.log('Token expiration scheduled in', Math.round(msUntilExpiry / 1000), 'seconds');
    this.expirationTimerId = setTimeout(() => this.onTokenExpired(), msUntilExpiry);
  }

  private clearExpirationTimer(): void {
    if (this.expirationTimerId) {
      clearTimeout(this.expirationTimerId);
      this.expirationTimerId = null;
    }
  }

  private onTokenExpired(): void {
    console.log('Token expired - redirecting to login');
    this.clearLocalAuth();
    // Use window.location to ensure full navigation to login
    const basePath = window.APP_CONFIG?.basePath || '/';
    window.location.href = `${basePath.replace(/\/+$/, '')}/login`;
  }

  isAuthenticated(): boolean {
    if (this.isTokenExpired()) {
      this.clearLocalAuth();
      return false;
    }
    return !!this.getToken();
  }

  isAuthCall(url: string): boolean {
    return url === this.tokenUrl;
  }

  // Method matching machine-operator AuthApiService pattern
  private createRequestOwnerPayload(userName: string, password: string) {
    const { scope, clientId, clientSecret } = this.oauthConfig;

    return {
      username: userName.toUpperCase(), // Convert username to uppercase
      password,
      grant_type: 'password',
      scope,
      client_id: clientId,
      client_secret: clientSecret,
    };
  }

  private createRevokePayload(token: string) {
    const { clientId, clientSecret } = this.oauthConfig;

    return {
      token,
      client_id: clientId,
      client_secret: clientSecret,
    };
  }

  // Method matching machine-operator AuthApiService pattern
  private mapToAuthPayload(payload: any): string {
    return Object.entries(payload)
      .map((keyValuePair) => `${keyValuePair[0]}=${keyValuePair[1]}`)
      .join('&');
  }

  // Method matching machine-operator AuthApiService pattern
  private createAuthRequestHeader() {
    const { clientId, clientSecret } = this.oauthConfig;
    const encodedToken = btoa(`${clientId}:${clientSecret}`);

    return new HttpHeaders()
      .append('Authorization', `Basic ${encodedToken}`)
      .append('Content-Type', 'application/x-www-form-urlencoded');
  }

  private handleAuthError(error: any): Observable<LoginResponse> {
    console.error('❌ AUTHENTICATION ERROR - FULL DETAILS:');
    console.error('❌ Error object:', error);
    console.error('❌ Error details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
      headers: error.headers,
      name: error.name,
      ok: error.ok,
      type: error.type,
    });

    if (error.error) {
      console.error('❌ Error response body:', error.error);
    }

    // Handle different types of errors
    let errorMessage = 'Login failed. Please try again.';

    if (error.status === 0) {
      if (error.message?.includes('ERR_CERT_COMMON_NAME_INVALID')) {
        errorMessage =
          'SSL Certificate error. The server certificate is invalid. Please contact your administrator or try using HTTP instead of HTTPS.';
      } else if (error.message?.includes('ERR_CERT')) {
        errorMessage = 'SSL Certificate error. Please contact your administrator.';
      } else {
        errorMessage =
          'Unable to connect to the server. This could be due to network issues, CORS restrictions, or SSL certificate problems. Please check your connection or contact support.';
      }
    } else if (error.status === 400) {
      errorMessage = 'Invalid username or password.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid username or password.';
    } else if (error.status === 403) {
      errorMessage = 'Access denied.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    console.error('❌ Final error message:', errorMessage);

    // Return a failed login response instead of throwing
    return of({
      success: false,
      message: errorMessage,
    } as LoginResponse);
  }
}
