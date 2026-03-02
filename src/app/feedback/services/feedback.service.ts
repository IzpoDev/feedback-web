import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../env/env';
import { FeedbackRequest, FeedbackResponse } from '../interfaces/feedback.interface';
import { UserResponse } from '../../user/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = env.url + '/feedbacks';

  sendFeedback(request : FeedbackRequest) : Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(this.apiUrl, request);
  }
  // Este metodo es logueado tenemos que implementar un interceptor para agregar el token a las peticiones
  getAllFeedbacksOwners(id : number) : Observable<FeedbackResponse[]> {
    return this.http.get<FeedbackResponse[]>(`${this.apiUrl}/${id}`);
  }
  getFeedbackById(id : number) : Observable<FeedbackResponse> {
    return this.http.get<FeedbackResponse>(`${this.apiUrl}/content/${id}`);
  }
  getOwnersForFeedback() : Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/owners`);
  }
  // Estos tres metodos son para el admin, tenemos que implementar un interceptor 
  // para agregar el token a las peticiones y verificar que el usuario sea admin
  //ademas de crear un guard para proteger las rutas de admin un dashboard de admin
  updateFeedback(id :number, request : FeedbackRequest) : Observable<FeedbackResponse> {
    return this.http.put<FeedbackResponse>(`${this.apiUrl}/${id}`, request);
  }
  deleteFeedback(id : number) : Observable<FeedbackResponse> {
    return this.http.delete<FeedbackResponse>(`${this.apiUrl}/${id}`); 
  }
  getAllFeedbacks() : Observable<FeedbackResponse[]> {
    return this.http.get<FeedbackResponse[]>(this.apiUrl);
  }
}
