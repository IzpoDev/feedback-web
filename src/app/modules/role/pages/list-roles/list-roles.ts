import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { RoleResponse, RoleRequest } from '../../interfaces/role.interface';
import { RegisterRole } from '../register-role/register-role';

@Component({
  selector: 'app-list-roles',
  imports: [CommonModule, ReactiveFormsModule, RegisterRole],
  templateUrl: './list-roles.html',
  styleUrl: './list-roles.css',
})
export class ListRoles implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  roles = signal<RoleResponse[]>([]);
  loading = signal(false);
  error = signal('');
  deletingRoleId = signal<number | null>(null);

  // Modal de edición
  showEditModal = signal(false);
  editingRole = signal<RoleResponse | null>(null);
  isUpdating = signal(false);
  editError = signal('');
  editSuccess = signal('');

  // Modal de registro (componente externo)
  showRegisterModal = signal(false);

  editForm: FormGroup = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRoles();
    }
  }

  private loadRoles(): void {
    this.loading.set(true);
    this.error.set('');

    this.roleService.getAllRoles().subscribe({
      next: (response) => {
        this.roles.set(response || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar los roles. Intenta nuevamente.');
        console.error('Error loading roles:', err);
      }
    });
  }

  // Eliminar rol
  deleteRole(roleId: number): void {
    if (this.deletingRoleId() === roleId) {
      this.deletingRoleId.set(-1);
      this.roleService.deleteRole(roleId).subscribe({
        next: () => {
          this.roles.update(items => items.filter(r => r.id !== roleId));
          this.deletingRoleId.set(null);
        },
        error: (err) => {
          this.deletingRoleId.set(null);
          this.error.set('Error al eliminar el rol.');
          console.error('Error deleting role:', err);
        }
      });
    } else {
      this.deletingRoleId.set(roleId);
    }
  }

  cancelDelete(): void {
    this.deletingRoleId.set(null);
  }

  // Modal de edición
  openEditModal(role: RoleResponse): void {
    this.editingRole.set(role);
    this.editForm.patchValue({
      name: role.name,
      description: role.description,
    });
    this.editError.set('');
    this.editSuccess.set('');
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingRole.set(null);
    this.editForm.reset();
    this.editError.set('');
    this.editSuccess.set('');
  }

  onEditSubmit(): void {
    if (this.editForm.valid) {
      const roleId = this.editingRole()?.id;
      if (!roleId) return;

      this.isUpdating.set(true);
      this.editError.set('');
      this.editSuccess.set('');

      const request: RoleRequest = this.editForm.getRawValue();

      this.roleService.updateRole(roleId, request).subscribe({
        next: (response) => {
          this.isUpdating.set(false);
          this.roles.update(items => 
            items.map(r => r.id === roleId ? response : r)
          );
          this.editSuccess.set('¡Rol actualizado exitosamente!');
          setTimeout(() => this.closeEditModal(), 1500);
        },
        error: (err) => {
          this.isUpdating.set(false);
          this.editError.set(err.error?.message || 'Error al actualizar el rol.');
          console.error('Error updating role:', err);
        }
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  // Modal de registro (componente externo)
  openRegisterModal(): void {
    this.showRegisterModal.set(true);
  }

  closeRegisterModal(): void {
    this.showRegisterModal.set(false);
  }

  onRoleCreated(role: RoleResponse): void {
    this.roles.update(items => [...items, role]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}