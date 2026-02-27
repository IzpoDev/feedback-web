export interface UserRequest {
    username : string;
    email : string;
    password : string;
}
export interface UserResponse {
    id : number;
    username : string;
    email : string;
    role : string;
}