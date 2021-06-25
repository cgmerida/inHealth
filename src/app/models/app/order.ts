import { Car } from './car';
import { User } from '../user';
import { Service } from '../service';

import { firestore } from 'firebase';

import Timestamp = firestore.Timestamp;

enum status {
  "Nuevo" = "Nuevo",
  "En Progreso" = "En Progreso",
  "Completado" = "Completado"
}

export interface Order {
  uid?: string;
  car: Car["uid"] | Car;
  date: Timestamp;
  services: Service[];
  // totalPrice?: number;
  progress: number;
  status: string;
  owner: User["uid"] | User;
  doneAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;

}