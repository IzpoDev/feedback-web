import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { FeedbackRequest } from '../../interfaces/feedback.interface';
import { UserResponse } from '../../../user/interfaces/user.interface';

@Component({
  selector: 'app-feedback',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackComponent implements OnInit {
  private readonly feedbackService = inject(FeedbackService);

  owners = signal<UserResponse[]>([]);
  selectedOwnerId = signal<number | null>(null);
  message = signal('');
  loading = signal(false);
  loadingOwners = signal(false);
  error = signal('');
  success = signal('');

  ngOnInit(): void {
    this.loadOwners();
  }

  private loadOwners(): void {
    this.loadingOwners.set(true);
    this.feedbackService.getOwnersForFeedback().subscribe({
      next: (response) => {
        this.owners.set(response || []);
        this.loadingOwners.set(false);
      },
      error: (err) => {
        this.loadingOwners.set(false);
        this.error.set('Error al cargar los destinatarios disponibles.');
        console.error('Error loading owners:', err);
      }
    });
  }

  onOwnerChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedOwnerId.set(value ? Number(value) : null);
  }

  submitFeedback(): void {
    this.error.set('');
    this.success.set('');

    const ownerId = this.selectedOwnerId();
    const content = this.message().trim();

    if (!ownerId) {
      this.error.set('Por favor selecciona a quién enviar el feedback.');
      return;
    }

    if (!content) {
      this.error.set('Por favor escribe tu mensaje de feedback.');
      return;
    }

    this.loading.set(true);

    const request: FeedbackRequest = {
      content: content,
      recipientId: ownerId
    };

    this.feedbackService.sendFeedback(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('¡Feedback enviado exitosamente! Gracias por tu comentario.');
        this.message.set('');
        this.selectedOwnerId.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al enviar el feedback. Intenta nuevamente.');
        console.error('Error sending feedback:', err);
      }
    });
  }
}

