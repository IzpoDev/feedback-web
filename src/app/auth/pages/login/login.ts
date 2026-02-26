import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage: string = '';
  isLoading: boolean = false;

  onSubmit(): void {
    if(this.loginForm.valid){
      this.isLoading = true;
      this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.router.navigate(['/feedback']);
        },
        error: (err) => {
          this.isLoading = false;
          if ( err.status == 401 || err.status == 404 ) {
            this.errorMessage = 'Credenciales invalidas. Por Favor intente nuevamente.';
        } else {
            this.errorMessage = 'Error al iniciar sesión. Por favor intente nuevamente más tarde.';
        }
        console.error('Login error:', err);
    }
        });
  } else {
  this.loginForm.markAllAsTouched();
   }
  }
}