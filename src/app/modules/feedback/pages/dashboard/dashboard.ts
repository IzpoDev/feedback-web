import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { FeedbackResponse } from '../../interfaces/feedback.interface';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
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

    this.feedbackService.getAllFeedbacksOwners(id).subscribe({
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

  editFeedback(feedbackId: number): void {
    this.editingFeedbackId.set(feedbackId);
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
