import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { FeedbackRequest } from '../../interfaces/feedback.interface';

@Component({
  selector: 'app-feedback',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackComponent implements OnInit {
  private readonly feedbackService = inject(FeedbackService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  recipientId = signal<number | null>(null);
  message = signal('');
  loading = signal(false);
  error = signal('');
  success = signal('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !isNaN(+idParam)) {
      this.recipientId.set(+idParam);
    } else {
      // Sin ID válido, redirigir a login
      this.router.navigate(['/login']);
    }
  }

  submitFeedback(): void {
    this.error.set('');
    this.success.set('');

    const ownerId = this.recipientId();
    const content = this.message().trim();

    if (!ownerId) {
      this.error.set('Enlace de feedback inválido.');
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
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al enviar el feedback. Intenta nuevamente.');
      }
    });
  }
}