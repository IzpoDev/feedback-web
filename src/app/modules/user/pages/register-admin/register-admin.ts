import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserRequest, UserResponse } from '../../interfaces/user.interface';

@Component({
  selector: 'app-register-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-admin.html',
  styleUrl: './register-admin.css',
})
export class RegisterAdmin {
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

      this.userService.createAdmin(request).subscribe({
        next: (response : UserResponse) => {
          this.isLoading.set(false);
          this.successMessage.set(`¡Admin creado exitosamente! ${response.username} ha sido registrado como administrador. Redirigiendo al dashboard...`);
          setTimeout(() => this.router.navigate(['/dashboard']), 2500);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 409) {
            this.errorMessage.set('El usuario o correo electrónico ya existe.');
          } else {
            this.errorMessage.set(err.error?.message || 'Error al crear el administrador. Por favor, intenta nuevamente.');
          }
          console.error('Register admin error:', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
