import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrivilegeService } from '../../services/privilege.service';
import { PrivilegeResponse, PrivilegeRequest } from '../../interfaces/privilege.interface';
import { RegisterPrivilege } from '../register-privilege/register-privilege';
import { MatchingPrivilegeRole } from '../matching-privilege-role/matching-privilege-role';

@Component({
  selector: 'app-list-privileges',
  imports: [CommonModule, ReactiveFormsModule, RegisterPrivilege, MatchingPrivilegeRole],
  templateUrl: './list-privileges.html',
  styleUrl: './list-privileges.css',
})
export class ListPrivileges implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly privilegeService = inject(PrivilegeService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  privileges = signal<PrivilegeResponse[]>([]);
  loading = signal(false);
  error = signal('');
  deletingPrivilegeId = signal<number | null>(null);

  // Vista actual: 'list' | 'matching'
  currentView = signal<'list' | 'matching'>('list');

  // Modal de edición
  showEditModal = signal(false);
  editingPrivilege = signal<PrivilegeResponse | null>(null);
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
      this.loadPrivileges();
    }
  }

  private loadPrivileges(): void {
    this.loading.set(true);
    this.error.set('');

    this.privilegeService.getAllPrivileges().subscribe({
      next: (response) => {
        this.privileges.set(response || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar los privilegios. Intenta nuevamente.');
        console.error('Error loading privileges:', err);
      }
    });
  }

  // Cambiar vista
  switchToList(): void {
    this.currentView.set('list');
  }

  switchToMatching(): void {
    this.currentView.set('matching');
  }

  // Eliminar privilegio
  deletePrivilege(privilegeId: number): void {
    if (this.deletingPrivilegeId() === privilegeId) {
      this.deletingPrivilegeId.set(-1);
      this.privilegeService.deletePrivilege(privilegeId).subscribe({
        next: () => {
          this.privileges.update(items => items.filter(p => p.id !== privilegeId));
          this.deletingPrivilegeId.set(null);
        },
        error: (err) => {
          this.deletingPrivilegeId.set(null);
          this.error.set('Error al eliminar el privilegio.');
          console.error('Error deleting privilege:', err);
        }
      });
    } else {
      this.deletingPrivilegeId.set(privilegeId);
    }
  }

  cancelDelete(): void {
    this.deletingPrivilegeId.set(null);
  }

  // Modal de edición
  openEditModal(privilege: PrivilegeResponse): void {
    this.editingPrivilege.set(privilege);
    this.editForm.patchValue({
      name: privilege.name,
      description: privilege.description,
    });
    this.editError.set('');
    this.editSuccess.set('');
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingPrivilege.set(null);
    this.editForm.reset();
    this.editError.set('');
    this.editSuccess.set('');
  }

  onEditSubmit(): void {
    if (this.editForm.valid) {
      const privilegeId = this.editingPrivilege()?.id;
      if (!privilegeId) return;

      this.isUpdating.set(true);
      this.editError.set('');
      this.editSuccess.set('');

      const request: PrivilegeRequest = this.editForm.getRawValue();

      this.privilegeService.updatePrivilege(privilegeId, request).subscribe({
        next: (response) => {
          this.isUpdating.set(false);
          this.privileges.update(items => 
            items.map(p => p.id === privilegeId ? response : p)
          );
          this.editSuccess.set('¡Privilegio actualizado exitosamente!');
          setTimeout(() => this.closeEditModal(), 1500);
        },
        error: (err) => {
          this.isUpdating.set(false);
          this.editError.set(err.error?.message || 'Error al actualizar el privilegio.');
          console.error('Error updating privilege:', err);
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

  onPrivilegeCreated(privilege: PrivilegeResponse): void {
    this.privileges.update(items => [...items, privilege]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
