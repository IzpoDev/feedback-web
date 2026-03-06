// src/app/modules/privilege/interfaces/privilege.interface.ts
export interface PrivilegeRequest {
    name: string;
    description: string;
}
export interface PrivilegeResponse {
    id: number;
    name: string;
    description: string;
}
export interface RolePrivilegeResponse {
    rolePrivilegeId: number;
    roleName: string;
    privilegeName: string
}