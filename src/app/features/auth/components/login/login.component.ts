import { Component, HostBinding } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { environment } from '../../../../core/config/environment';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoDirective,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @HostBinding('class') hostClass = 'flex h-screen w-screen justify-center items-center';

  protected form;

  protected passwordFieldType: 'password' | 'text' = 'password';

  isLoading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      userName: this.fb.nonNullable.control('', { validators: [Validators.required] }),
      password: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    });
  }
  onSubmit() {
    if (!this.form.valid) {
      this.error = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.error = '';

    const { userName, password } = this.form.getRawValue();

    console.log('🚀 Starting login process...', {
      username: userName,
      baseApiUrl: environment.baseApiUrl,
      timestamp: new Date().toISOString(),
    });

    const credentials: LoginRequest = {
      username: userName,
      password: password,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('🎯 LOGIN COMPONENT - Received response from auth service:');
        console.log('🎯 Full response object:', response);
        console.log('🎯 Response properties:', {
          success: response.success,
          message: response.message,
          access_token: response.access_token
            ? `${response.access_token.substring(0, 20)}...`
            : 'NOT_PROVIDED',
          expires_in: response.expires_in,
          token_type: response.token_type,
          user: response.user,
          all_keys: Object.keys(response),
          timestamp: new Date().toISOString(),
        });

        this.isLoading = false;
        if (response.success) {
          console.log('✅ Login successful, redirecting to dashboard...');
          this.router.navigate(['/dashboard']);
        } else {
          console.warn('⚠️ Login response indicates failure:', response.message);
          this.error = response.message || 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        console.error('💥 LOGIN COMPONENT - Error in subscribe:');
        console.error('💥 Error object:', error);
        console.error('💥 Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });

        this.isLoading = false;
        this.error = 'Login failed. Please try again.';
      },
    });
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
