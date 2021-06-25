import { User } from 'firebase';
import { Order } from './order';

export class Responses {
    uid?: string;
    owner: User["uid"];
    orderUid: Order["uid"];
    responses: Response[]; // [{question: "", rating:"0-5"}]
    createdAt: Date;
    updatedAt: Date;
}

export class Response {
    question: string;
    rating: number;
}