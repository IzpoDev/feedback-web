//src/app/modules/user/pages/admin-users-list/admin-users-list.ts
import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserResponse, UserRequest } from '../../interfaces/user.interface';

@Component({
  selector: 'app-admin-users-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users-list.html',
  styleUrl: './admin-users-list.css',
})
export class AdminUsersList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  users = signal<UserResponse[]>([]);
  loading = signal(false);
  error = signal('');
  deletingUserId = signal<number | null>(null);

  // Modal de edición
  showEditModal = signal(false);
  editingUser = signal<UserResponse | null>(null);
  isUpdating = signal(false);
  editError = signal('');
  editSuccess = signal('');
  currentAdminId = signal<number | null>(null);

  editForm: FormGroup = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCurrentAdmin();
      this.loadUsers();
    }
  }

  private loadCurrentAdmin(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentAdminId.set(user.id);
    }
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.userService.getAll().subscribe({
      next: (response) => {
        this.users.set(response || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar los usuarios. Intenta nuevamente.');
        console.error('Error loading users:', err);
      }
    });
  }

  deleteUser(userId: number): void {
    if (this.deletingUserId() === userId) {
      // Confirmar eliminación
      this.deletingUserId.set(-1);
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users.update(items => items.filter(u => u.id !== userId));
          this.deletingUserId.set(null);
        },
        error: (err) => {
          this.deletingUserId.set(null);
          this.error.set('Error al eliminar el usuario.');
          console.error('Error deleting user:', err);
        }
      });
    } else {
      this.deletingUserId.set(userId);
    }
  }

  cancelDelete(): void {
    this.deletingUserId.set(null);
  }

  // Modal de edición
  openEditModal(user: UserResponse): void {
    this.editingUser.set(user);
    this.editForm.patchValue({
      username: user.username,
      email: user.email,
    });
    this.editError.set('');
    this.editSuccess.set('');
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingUser.set(null);
    this.editForm.reset();
    this.editError.set('');
    this.editSuccess.set('');
  }

  onEditSubmit(): void {
    if (this.editForm.valid) {
      const userId = this.editingUser()?.id;
      if (!userId) return;
      console.log(userId);
      this.isUpdating.set(true);
      this.editError.set('');
      this.editSuccess.set('');

      const request: UserRequest = {
        username: this.editForm.value.username,
        email: this.editForm.value.email,
        password: 'sinDefinir'
      };
      this.userService.updateUser(userId, request).subscribe({
        next: (response) => {
          this.isUpdating.set(false);
          
          // Si el admin editó su propio registro, actualizar token y user en localStorage
          if (userId === this.currentAdminId() && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          // Actualizar la lista de usuarios
          this.users.update(items => 
            items.map(u => u.id === userId ? response.user : u)
          );

          this.editSuccess.set('¡Usuario actualizado exitosamente!');
          setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            window.location.reload();
          }
        }, 1000);
        },
        error: (err) => {
          this.isUpdating.set(false);
          this.editError.set(err.error?.message || 'Error al actualizar el usuario.');
          console.error('Error updating user:', err);
        }
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
