// src/app/modules/privilege/services/privilege.service.ts
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { env } from "../../../env/env";
import { PrivilegeRequest, PrivilegeResponse, RolePrivilegeResponse } from "../interfaces/privilege.interface";

@Injectable({
    providedIn: 'root',
})
export class PrivilegeService {
    private readonly apiUrl = env.url + '/privileges';
    private readonly http = inject(HttpClient);

    createPrivilege(request : PrivilegeRequest) : Observable<PrivilegeResponse> {
        return this.http.post<PrivilegeResponse>(this.apiUrl, request);
    }
    getAllPrivileges() : Observable<PrivilegeResponse[]> {
        return this.http.get<PrivilegeResponse[]>(this.apiUrl);
    }
    getAllPrivilegesWithRoles() : Observable<RolePrivilegeResponse[]>{
        return this.http.get<RolePrivilegeResponse[]>(`${this.apiUrl}/roles-privileges`);
    }
    getPrivilegeById(id : number) : Observable<PrivilegeResponse> {
        return this.http.get<PrivilegeResponse>(`${this.apiUrl}/${id}`);
    }
    updatePrivilege(id :number, request : PrivilegeRequest) : Observable<PrivilegeResponse> {
        return this.http.put<PrivilegeResponse>(`${this.apiUrl}/${id}`, request);
    }
    deletePrivilege(id:number) : Observable<string> {
        return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
    }
    assignPrivilegeToRole(roleId: number, privilegeId : number) : Observable<string> {
        return this.http.post(`${this.apiUrl}/role/${roleId}/privilege/${privilegeId}`, {}, { responseType: 'text' });
    }
    removePrivilegeFromRole(roleId: number, privilegeId : number) : Observable<string> {
        return this.http.delete(`${this.apiUrl}/role/${roleId}/privilege/${privilegeId}`, { responseType: 'text' });
    }
}