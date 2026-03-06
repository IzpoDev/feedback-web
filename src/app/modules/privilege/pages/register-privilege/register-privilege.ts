import { Component, inject, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrivilegeService } from '../../services/privilege.service';
import { PrivilegeRequest, PrivilegeResponse } from '../../interfaces/privilege.interface';

@Component({
  selector: 'app-register-privilege',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-privilege.html',
  styleUrl: './register-privilege.css',
})
export class RegisterPrivilege {
  private readonly fb = inject(FormBuilder);
  private readonly privilegeService = inject(PrivilegeService);

  isOpen = input.required<boolean>();
  privilegeCreated = output<PrivilegeResponse>();
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

      const request: PrivilegeRequest = this.registerForm.getRawValue();

      this.privilegeService.createPrivilege(request).subscribe({
        next: (response) => {
          this.isCreating.set(false);
          this.success.set('¡Privilegio creado exitosamente!');
          this.privilegeCreated.emit(response);
          setTimeout(() => this.close(), 1500);
        },
        error: (err) => {
          this.isCreating.set(false);
          this.error.set(err.error?.message || 'Error al crear el privilegio.');
          console.error('Error creating privilege:', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
