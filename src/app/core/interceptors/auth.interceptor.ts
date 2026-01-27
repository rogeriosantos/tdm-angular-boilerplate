import { HttpRequest, HttpEvent, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { environment } from '../config/environment';

export const authInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add auth token to API calls matching known base URLs or proxied paths
  const isKnownApi =
    request.url.startsWith(environment.baseApiUrl) ||
    request.url.startsWith(environment.stockApiUrl);

  const shouldNotAddAuthToken = !isKnownApi || authService.isAuthCall(request.url);

  if (shouldNotAddAuthToken) {
    return next(request);
  }

  // Get the token and add it to the request
  const token = authService.getToken();

  if (token) {
    const headers = request.headers.set('Authorization', `Bearer ${token}`);
    const authenticatedRequest = request.clone({ headers });

    return next(authenticatedRequest).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Token expired or invalid, redirect to login
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(request);
};
