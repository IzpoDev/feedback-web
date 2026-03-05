import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserRequest, UserResponse } from '../../interfaces/user.interface';

@Component({
  selector: 'app-user-setting',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-setting.html',
  styleUrl: './user-setting.css',
})
export class UserSetting implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  user = signal<UserResponse | null>(null);
  token = signal<string | null>(null);
  isLoading = signal(false);
  isDeleting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showDeleteConfirm = signal(false);

  profileForm: FormGroup = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
    }
  }

  private loadUserData(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      this.user.set(userData);
      this.profileForm.patchValue({
        username: userData.username,
        email: userData.email,
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const userId = this.user()?.id;

      if (!userId) {
        this.errorMessage.set('Error: No se encontró el ID del usuario.');
        this.isLoading.set(false);
        return;
      }

      const request: UserRequest = this.profileForm.getRawValue();
      request.password = "sinDefinir"; // No se actualiza la contraseña aquí

      this.userService.updateUser(userId, request).subscribe({
        next: (response) => {
          
          this.isLoading.set(false);
          this.user.set(response.user);
          this.token.set(response.token);

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
          }
          this.successMessage.set('¡Perfil actualizado exitosamente!');
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Error al actualizar el perfil. Por favor, intenta nuevamente.');
          console.error('Update user error:', err);
        }
      });
      
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  toggleDeleteConfirm(): void {
    this.showDeleteConfirm.update(prev => !prev);
  }

  deleteAccount(): void {
    const userId = this.user()?.id;
    if (!userId) {
      this.errorMessage.set('Error: No se encontró el ID del usuario.');
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set('');

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        this.router.navigate(['']);
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.errorMessage.set(err.error?.message || 'Error al eliminar la cuenta. Por favor, intenta nuevamente.');
        console.error('Delete user error:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
