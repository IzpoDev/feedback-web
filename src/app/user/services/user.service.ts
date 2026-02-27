import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../env/env';
import { UserRequest, UserResponse } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private readonly apiUtl = env.url + '/users';
  private readonly http = inject(HttpClient);

  createUser(request: UserRequest) : Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUtl,request);
  }
  getById(id : number) : Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUtl}/${id}`);
  }
  getAll() : Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUtl);
  }
  getAllActive() : Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUtl}/active`);
  }
  updateUser(id: number, request : UserRequest) : Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUtl}/${id}`, request);
  }
  deleteUser(id:number) : Observable<UserResponse> {
    return this.http.delete<UserResponse>(`${this.apiUtl}/${id}`);
  }
  createAdmin(request: UserRequest) : Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUtl}/admin`,request);
  }
}
