import { Component, inject, signal, OnInit, PLATFORM_ID, input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrivilegeService } from '../../services/privilege.service';
import { PrivilegeResponse, RolePrivilegeResponse } from '../../interfaces/privilege.interface';
import { RoleService } from '../../../role/services/role.service';
import { RoleResponse } from '../../../role/interfaces/role.interface';

@Component({
  selector: 'app-matching-privilege-role',
  imports: [CommonModule, FormsModule],
  templateUrl: './matching-privilege-role.html',
  styleUrl: './matching-privilege-role.css',
})
export class MatchingPrivilegeRole implements OnInit {
  private readonly privilegeService = inject(PrivilegeService);
  private readonly roleService = inject(RoleService);
  private readonly platformId = inject(PLATFORM_ID);

  isVisible = input.required<boolean>();

  roles = signal<RoleResponse[]>([]);
  privileges = signal<PrivilegeResponse[]>([]);
  relations = signal<RolePrivilegeResponse[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');

  // Formulario de asignación
  selectedRoleId = signal<number | null>(null);
  selectedPrivilegeId = signal<number | null>(null);
  isAssigning = signal(false);

  // Eliminación de relación
  deletingRelationId = signal<number | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set('');

    // Cargar roles
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles || []);
        this.loadPrivileges();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar los roles.');
        console.error('Error loading roles:', err);
      }
    });
  }

  private loadPrivileges(): void {
    this.privilegeService.getAllPrivileges().subscribe({
      next: (privileges) => {
        this.privileges.set(privileges || []);
        this.loadRelations();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar los privilegios.');
        console.error('Error loading privileges:', err);
      }
    });
  }

  private loadRelations(): void {
    this.privilegeService.getAllPrivilegesWithRoles().subscribe({
      next: (relations) => {
        this.relations.set(relations || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar las relaciones.');
        console.error('Error loading relations:', err);
      }
    });
  }

  onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value ? parseInt(select.value, 10) : null;
    this.selectedRoleId.set(value);
  }

  onPrivilegeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value ? parseInt(select.value, 10) : null;
    this.selectedPrivilegeId.set(value);
  }

  assignPrivilege(): void {
    const roleId = this.selectedRoleId();
    const privilegeId = this.selectedPrivilegeId();

    if (!roleId || !privilegeId) {
      this.error.set('Debes seleccionar un rol y un privilegio.');
      return;
    }

    this.isAssigning.set(true);
    this.error.set('');
    this.success.set('');

    this.privilegeService.assignPrivilegeToRole(roleId, privilegeId).subscribe({
      next: (message) => {
        this.isAssigning.set(false);
        this.success.set(message || '¡Privilegio asignado exitosamente!');
        this.selectedRoleId.set(null);
        this.selectedPrivilegeId.set(null);
        // Recargar relaciones para obtener el nuevo ID
        this.loadRelations();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        this.isAssigning.set(false);
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Error al asignar el privilegio.');
        this.error.set(errorMsg);
        console.error('Error assigning privilege:', err);
      }
    });
  }

  removeRelation(relation: RolePrivilegeResponse): void {
    if (this.deletingRelationId() === relation.rolePrivilegeId) {
      // Confirmar eliminación - necesitamos obtener roleId y privilegeId
      const role = this.roles().find(r => r.name === relation.roleName);
      const privilege = this.privileges().find(p => p.name === relation.privilegeName);
      
      if (!role || !privilege) {
        this.error.set('Error: No se pudo identificar el rol o privilegio.');
        this.deletingRelationId.set(null);
        return;
      }

      this.privilegeService.removePrivilegeFromRole(role.id, privilege.id).subscribe({
        next: (message) => {
          this.relations.update(items => 
            items.filter(r => r.rolePrivilegeId !== relation.rolePrivilegeId)
          );
          this.deletingRelationId.set(null);
          this.success.set(message || '¡Privilegio removido exitosamente!');
          setTimeout(() => this.success.set(''), 3000);
        },
        error: (err) => {
          this.deletingRelationId.set(null);
          const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Error al remover el privilegio.');
          this.error.set(errorMsg);
          console.error('Error removing privilege:', err);
        }
      });
    } else {
      // Mostrar confirmación
      this.deletingRelationId.set(relation.rolePrivilegeId);
    }
  }

  cancelRemove(): void {
    this.deletingRelationId.set(null);
  }

  isDeleting(relationId: number): boolean {
    return this.deletingRelationId() === relationId;
  }
}
