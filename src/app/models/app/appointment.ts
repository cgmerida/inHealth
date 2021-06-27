
import { User } from '../user';
import { Clinic } from './clinic';

import { firestore } from 'firebase';

import Timestamp = firestore.Timestamp;

export const enum status_enum {
  "Agendada" = "Agendada",
  "Reagendada" = "Reagendada",
  "Esperando resultados" = "Esperando resultados",
  "Completada" = "Completada",
  "Cancelada" = "Cancelada"
}

export interface Appointment {
  uid?: string;
  date: Timestamp;
  clinic: string;
  specialty: Clinic["specialties"];
  status: status_enum;
  owner: User["uid"];
  doneAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;

}