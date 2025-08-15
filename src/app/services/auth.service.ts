import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../config/environment';

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
  private tokenUrl = `${this.baseUrl}/identity/connect/token`;
  private userInfoUrl = `${this.baseUrl}/identity/connect/userinfo`;
  private revokeUrl = `${this.baseUrl}/identity/connect/revocation`;

  // OAuth2 Resource Owner configuration (from environment)
  private oauthConfig = environment.oauthConfig;

  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      this.currentUserSubject.next({ token });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Attempting authentication with URL:', this.tokenUrl);

    const payload = this.createRequestOwnerPayload(credentials.username, credentials.password);
    const body = this.mapToAuthPayload(payload);
    const headers = this.createAuthRequestHeader();

    return this.http.post<BearerTokenResponse>(this.tokenUrl, body, { headers }).pipe(
      map(
        (response) =>
          ({
            access_token: response.access_token,
            expires_in: response.expires_in,
            token_type: response.token_type,
            success: true,
            message: 'Login successful',
          } as LoginResponse)
      ),
      tap((response) => {
        if (response.success && response.access_token) {
          this.setToken(response.access_token);
          this.currentUserSubject.next({ token: response.access_token });
          console.log('Authentication successful');
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
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAuthCall(url: string): boolean {
    return url === this.tokenUrl;
  }

  // Method matching machine-operator AuthApiService pattern
  private createRequestOwnerPayload(userName: string, password: string) {
    const { scope, clientId, clientSecret } = this.oauthConfig;

    return {
      username: userName,
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
    console.error('Authentication error details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
    });

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

    // Return a failed login response instead of throwing
    return of({
      success: false,
      message: errorMessage,
    } as LoginResponse);
  }
}
