//src/app/modules/user/pages/admin-users-list/admin-users-list.ts
import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../interfaces/user.interface';

@Component({
  selector: 'app-admin-users-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users-list.html',
  styleUrl: './admin-users-list.css',
})
export class AdminUsersList implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  users = signal<UserResponse[]>([]);
  loading = signal(false);
  error = signal('');
  deletingUserId = signal<number | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
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

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
