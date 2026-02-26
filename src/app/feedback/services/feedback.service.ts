import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../env/env';

export interface RecommendationItem {
  [key: string]: string;
}

export type FeedbackResponse = RecommendationItem[];

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private http = inject(HttpClient);
  private webhookUrl = env.url;

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  sendFeedback(message: string): Observable<FeedbackResponse> {
    const sessionId = this.generateSessionId();
    const payload = {
      message,
      sessionId
    };
    return this.http.post<FeedbackResponse>(this.webhookUrl, payload);
  }
}
