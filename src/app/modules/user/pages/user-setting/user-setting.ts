import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserRequest, UserResponse } from '../../interfaces/user.interface';

@Component({
  selector: 'app-user-setting',
  imports: [CommonModule, ReactiveFormsModule],
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

  // Image upload
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploadingImage = signal(false);
  uploadImageError = signal('');
  uploadImageSuccess = signal('');

  readonly MAX_FILE_SIZE_MB = 50;

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxBytes = this.MAX_FILE_SIZE_MB * 1024 * 1024;

    this.uploadImageError.set('');
    this.uploadImageSuccess.set('');

    if (file.size > maxBytes) {
      this.uploadImageError.set(`El archivo supera el límite de ${this.MAX_FILE_SIZE_MB} MB.`);
      this.selectedFile.set(null);
      this.previewUrl.set(null);
      input.value = '';
      return;
    }

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  onUploadImage(): void {
    const file = this.selectedFile();
    const userId = this.user()?.id;

    if (!file || !userId) return;

    this.isUploadingImage.set(true);
    this.uploadImageError.set('');
    this.uploadImageSuccess.set('');

    this.userService.uploadImage(userId, file).subscribe({
      next: (updatedUser) => {
        this.isUploadingImage.set(false);
        this.user.set(updatedUser);
        this.selectedFile.set(null);
        this.previewUrl.set(null);

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        this.uploadImageSuccess.set('¡Foto de perfil actualizada exitosamente!');
        setTimeout(() => this.uploadImageSuccess.set(''), 4000);
      },
      error: (err) => {
        this.isUploadingImage.set(false);
        this.uploadImageError.set(
          err.error?.message || 'Error al subir la imagen. Por favor, intenta nuevamente.'
        );
        console.error('Upload image error:', err);
      }
    });
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
      request.password = 'sinDefinir';

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
          this.errorMessage.set(
            err.error?.message || 'Error al actualizar el perfil. Por favor, intenta nuevamente.'
          );
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
        this.errorMessage.set(
          err.error?.message || 'Error al eliminar la cuenta. Por favor, intenta nuevamente.'
        );
        console.error('Delete user error:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
