import { Car } from './car';

export class Km {
  uid?: string;
  km: number;
  car: Car["uid"];
  createdAt: Date;
}