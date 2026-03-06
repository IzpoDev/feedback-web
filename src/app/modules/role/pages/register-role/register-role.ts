import { Component, inject, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { RoleRequest, RoleResponse } from '../../interfaces/role.interface';

@Component({
  selector: 'app-register-role',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-role.html',
  styleUrl: './register-role.css',
})
export class RegisterRole {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);

  isOpen = input.required<boolean>();
  roleCreated = output<RoleResponse>();
  closed = output<void>();

  isCreating = signal(false);
  error = signal('');
  success = signal('');

  registerForm: FormGroup = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  close(): void {
    this.registerForm.reset();
    this.error.set('');
    this.success.set('');
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isCreating.set(true);
      this.error.set('');
      this.success.set('');

      const request: RoleRequest = this.registerForm.getRawValue();

      this.roleService.createRole(request).subscribe({
        next: (response) => {
          this.isCreating.set(false);
          this.success.set('¡Rol creado exitosamente!');
          this.roleCreated.emit(response);
          setTimeout(() => this.close(), 1500);
        },
        error: (err) => {
          this.isCreating.set(false);
          this.error.set(err.error?.message || 'Error al crear el rol.');
          console.error('Error creating role:', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
