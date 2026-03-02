import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, LoginResponse } from '../../interfaces/login.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  loginForm: FormGroup = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage: string = '';
  isLoading: boolean = false;

  onSubmit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if(this.loginForm.valid){
      this.isLoading = true;
      this.errorMessage = '';
      const request : LoginRequest = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      }
      console.log('Enviando request:', request); // Debug log

      this.authService.login(request).subscribe({
          next: (response : LoginResponse) => { 
            this.isLoading = false;
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('token', response.token);
              localStorage.setItem('user', JSON.stringify(response.user));              
            }
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.isLoading = false;
            if ( err.status == 401 || err.status == 404 || err.status == 500) {
              this.errorMessage = 'Credenciales invalidas. Por Favor intente nuevamente.';
              this.isLoading = false;
          } else {
              this.errorMessage = 'Error al iniciar sesión. Por favor intente nuevamente más tarde.';
              this.isLoading = false;
          }
          console.error('Login error:', err);
      }
          });
    } else {
    this.loginForm.markAllAsTouched();
    }
  }
}
