// src/app/auth/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../env/env';
import { LoginRequest,LoginResponse } from '../interfaces/login.interface';
import { ForgotPasswordRequest, ForgotPasswordResponse } from '../interfaces/forgot-password.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly apiUrl = env.url + '/auth';
  private readonly http = inject(HttpClient);

  login(request : LoginRequest) : Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request);
  }

  startForgotPassword(email : string) : Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password/${email}`, {});
  }
  resetPassword(request : ForgotPasswordRequest) {
    return this.http.put(`${this.apiUrl}/reset-password`, request, { responseType: 'text' });
  }

}
