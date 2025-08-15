import { Component, HostBinding } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginRequest } from '../services/auth.service';
import { environment } from '../config/environment';

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

    console.log('Starting login process...', {
      username: userName,
      baseApiUrl: environment.baseApiUrl,
    });

    const credentials: LoginRequest = {
      username: userName,
      password: password,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          console.log('Login successful, redirecting...');
          this.router.navigate(['/dashboard']);
        } else {
          this.error = response.message || 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Login failed. Please try again.';
        console.error('Login error:', error);
      },
    });
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
