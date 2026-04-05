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

  // Audio feedback signals
  sendMode = signal<'text' | 'audio'>('text');
  isRecording = signal(false);
  audioBlob = signal<Blob | null>(null);
  recordingTime = signal(0);
  
  private mediaRecorder: MediaRecorder | null = null;
  private recordingInterval: ReturnType<typeof setInterval> | null = null;
  private audioChunks: Blob[] = [];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !isNaN(+idParam)) {
      this.recipientId.set(+idParam);
    } else {
      // Sin ID válido, redirigir a login
      this.router.navigate(['/login']);
    }
  }

  switchMode(mode: 'text' | 'audio'): void {
    this.sendMode.set(mode);
    this.error.set('');
    this.success.set('');
    this.audioBlob.set(null);
    this.recordingTime.set(0);
    if (this.mediaRecorder?.state === 'recording') {
      this.stopRecording();
    }
  }

  submitFeedback(): void {
    this.error.set('');
    this.success.set('');

    const ownerId = this.recipientId();

    if (!ownerId) {
      this.error.set('Enlace de feedback inválido.');
      return;
    }

    // Enviar según el modo
    if (this.sendMode() === 'text') {
      this.submitTextFeedback(ownerId);
    } else {
      this.submitAudioFeedback(ownerId);
    }
  }

  private submitTextFeedback(ownerId: number): void {
    const content = this.message().trim();

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

  private submitAudioFeedback(ownerId: number): void {
    const audio = this.audioBlob();

    if (!audio) {
      this.error.set('Por favor graba un audio antes de enviar.');
      return;
    }

    this.loading.set(true);

    const audioFile = new File([audio], 'feedback-audio.webm', { type: 'audio/webm' });

    this.feedbackService.sendFeedbackWithAudio(audioFile, ownerId).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('¡Feedback de audio enviado exitosamente! Gracias por tu comentario.');
        this.audioBlob.set(null);
        this.recordingTime.set(0);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al enviar el feedback. Intenta nuevamente.');
      }
    });
  }

  async startRecording(): Promise<void> {
    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioBlob.set(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingTime.set(0);
      this.error.set('');

      // Actualizar tiempo cada segundo
      this.recordingInterval = setInterval(() => {
        this.recordingTime.update(time => time + 1);
      }, 1000);
    } catch (err) {
      this.error.set('No se pudo acceder al micrófono. Verifica los permisos.');
      console.error('Error al acceder al micrófono:', err);
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }
    }
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }
    }
    this.audioBlob.set(null);
    this.recordingTime.set(0);
    this.error.set('');
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}