import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackService, type RecommendationItem } from '../../services/feedback.service';
@Component({
  selector: 'app-feedback',
  imports: [FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackComponent {
  private feedbackService = inject(FeedbackService);

  message = signal('');
  loading = signal(false);
  recommendations = signal<RecommendationItem[]>([]);
  error = signal('');

  // Hacer Object.keys disponible en el template
  protected readonly Object = Object;

  submitFeedback() {
    const messageValue = this.message();
    
    if (!messageValue.trim()) {
      this.error.set('Por favor ingresa un mensaje');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.recommendations.set([]);

    this.feedbackService.sendFeedback(messageValue).subscribe({
      next: (response) => {
        this.recommendations.set(response || []);
        this.message.set('');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al enviar el feedback');
        this.loading.set(false);
      }
    });
  }
}
