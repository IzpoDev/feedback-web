import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { env } from "../../../env/env";
import { RoleRequest, RoleResponse } from "../interfaces/role.interface";

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = env.url + '/roles';
    //Todos estos metodos son exclusivamente de los admin, tenemos que implementar un interceptor para agregar el token a las peticiones y verificar que el usuario sea admin
    createRole( request: RoleRequest) : Observable<RoleResponse> {
        return this.http.post<RoleResponse>(this.apiUrl, request);
    }
    getAllRoles() : Observable<RoleResponse[]> {
        return this.http.get<RoleResponse[]>(this.apiUrl);
    }
    getRoleById(id :number) : Observable<RoleResponse> {
        return this.http.get<RoleResponse>(`${this.apiUrl}/${id}`);
    }
    updateRole(id:number, request: RoleRequest) : Observable<RoleResponse> {
        return this.http.put<RoleResponse>(`${this.apiUrl}/${id}`, request);
    }
    deleteRole(id:number) : Observable<string> {
        return this.http.delete<string>(`${this.apiUrl}/${id}`);
    }
}