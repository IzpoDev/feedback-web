import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserRequest } from '../../interfaces/user.interface';

@Component({
  selector: 'app-register-owner',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-owner.html',
  styleUrl: './register-owner.css',
})
export class RegisterOwnerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  registerForm: FormGroup = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const request: UserRequest = this.registerForm.getRawValue();

      this.userService.createUser(request).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(`¡Cuenta creada exitosamente! Bienvenido ${response.username}. Redirigiendo al login...`);
          setTimeout(() => this.router.navigate(['/login']), 2500);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 409) {
            this.errorMessage.set('El usuario o correo electrónico ya existe.');
          } else {
            this.errorMessage.set(err.error?.message || 'Error al crear la cuenta. Por favor, intenta nuevamente.');
          }
          console.error('Register error:', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
