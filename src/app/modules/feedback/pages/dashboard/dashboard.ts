import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { FeedbackResponse, FeedbackRequest } from '../../interfaces/feedback.interface';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  username = signal('');
  userId = signal<number | null>(null);
  userRole = signal<string>('');
  feedbacks = signal<FeedbackResponse[]>([]);
  loading = signal(false);
  error = signal('');
  userMenuOpen = signal(false);
  editingFeedbackId = signal<number | null>(null);
  deletingFeedbackId = signal<number | null>(null);

  // Modal de edición de feedback
  showEditModal = signal(false);
  editingFeedback = signal<FeedbackResponse | null>(null);
  isUpdating = signal(false);
  editError = signal('');
  editSuccess = signal('');

  editForm: FormGroup = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
      this.loadFeedbacks();
    }
  }

  private loadUserData(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.username.set(user.username || 'Usuario');
      this.userId.set(user.id);
      this.userRole.set(user.role || '');
    }
  }

  isAdmin(): boolean {
    return this.userRole() === 'ADMIN';
  }

  loadFeedbacks(): void {
    const id = this.userId();
    if (!id) return;

    this.loading.set(true);
    this.error.set('');

    // Si es admin, cargar todos los feedbacks; si no, solo los del owner
    const feedbackCall = this.isAdmin() 
      ? this.feedbackService.getAllFeedbacks()
      : this.feedbackService.getAllFeedbacksOwners(id);

    feedbackCall.subscribe({
      next: (response) => {
        this.feedbacks.set(response || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al cargar los feedbacks. Intenta nuevamente.');
        console.error('Error loading feedbacks:', err);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(prev => !prev);
  }

  editFeedback(feedback: FeedbackResponse): void {
    this.editingFeedback.set(feedback);
    this.editForm.patchValue({
      content: feedback.content,
    });
    this.editError.set('');
    this.editSuccess.set('');
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingFeedback.set(null);
    this.editForm.reset();
    this.editError.set('');
    this.editSuccess.set('');
  }

  onEditSubmit(): void {
    if (this.editForm.valid) {
      const feedback = this.editingFeedback();
      if (!feedback) return;

      this.isUpdating.set(true);
      this.editError.set('');
      this.editSuccess.set('');

      const request: FeedbackRequest = {
        content: this.editForm.value.content,
        recipientId: feedback.recipientId
      };

      this.feedbackService.updateFeedback(feedback.id, request).subscribe({
        next: (response) => {
          this.isUpdating.set(false);
          
          // Actualizar la lista de feedbacks
          this.feedbacks.update(items => 
            items.map(f => f.id === feedback.id ? response : f)
          );

          this.editSuccess.set('¡Feedback actualizado exitosamente!');
          setTimeout(() => this.closeEditModal(), 1500);
        },
        error: (err) => {
          this.isUpdating.set(false);
          this.editError.set(err.error?.message || 'Error al actualizar el feedback.');
          console.error('Error updating feedback:', err);
        }
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  deleteFeedback(feedbackId: number): void {
    if (this.deletingFeedbackId() === feedbackId) {
      // Confirmar eliminación
      this.deletingFeedbackId.set(-1);
      this.feedbackService.deleteFeedback(feedbackId).subscribe({
        next: () => {
          this.feedbacks.update(items => items.filter(f => f.id !== feedbackId));
          this.deletingFeedbackId.set(null);
        },
        error: (err) => {
          this.deletingFeedbackId.set(null);
          this.error.set('Error al eliminar el feedback.');
          console.error('Error deleting feedback:', err);
        }
      });
    } else {
      this.deletingFeedbackId.set(feedbackId);
    }
  }

  cancelDelete(): void {
    this.deletingFeedbackId.set(null);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }
}
