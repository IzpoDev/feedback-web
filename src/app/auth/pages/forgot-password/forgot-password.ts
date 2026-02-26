// src/app/auth/pages/forgot-password/forgot-password.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  step = signal<1 | 2>(1);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  //Formulario paso 1
  emailForm: FormGroup = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]], 
  });

  //Paso 2 Formulario: Restablecer Contraseña
  resetForm: FormGroup = this.fb.nonNullable.group({
    email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
    token : ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onRequestToken() {
    if (this.emailForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      const email = this.emailForm.get('email')?.value;
      this.authService.startForgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(`Se ha enviado un correo a ${response.email} con instrucciones para restablecer tu contraseña.`);
          this.resetForm.get('email')?.setValue(response.email);
          this.step.set(2);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Error al solicitar el restablecimiento de contraseña. Por favor, intenta nuevamente.');
        }
    });
  } else {
    this.emailForm.markAllAsTouched();
  }
}

onResetPassword() {
  if (this.resetForm.valid) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      email: this.resetForm.getRawValue().email,
      token: this.resetForm.get('token')?.value,
      password: this.resetForm.get('password')?.value,
    }
    this.authService.resetPassword(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response || 'Contraseña restablecida exitosamente. Redirigiendo al login...');
        setTimeout (() => this.router.navigate(['/login']), 2500);
      },
      error : (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al restablecer la contraseña. Por favor, intenta nuevamente.');
      } 
    });
} else {
    this.resetForm.markAllAsTouched();
  }
}

}
