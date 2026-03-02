export interface FeedbackRequest {
    content : string;
    recipientId : number;
}
export interface FeedbackResponse {
    id : number;
    content : string;
    recipientId : number;
    createdAt : string;
}