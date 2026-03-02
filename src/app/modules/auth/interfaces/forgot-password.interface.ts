export interface ForgotPasswordRequest {
    token: string,
    password: string,
    email : string
}

export interface ForgotPasswordResponse {
    email : string,
    link : string
}