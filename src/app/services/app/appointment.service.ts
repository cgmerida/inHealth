import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Appointment, status_enum } from 'src/app/models/app/appointment';
import { Clinic } from 'src/app/models/app/clinic';
import { User } from 'src/app/models/user';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private appointmentCollection: AngularFirestoreCollection<Appointment>;

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,) {

    this.appointmentCollection = this.db.collection<Appointment>('appointments');
  }

  getAppointments() {
    return this.appointmentCollection.valueChanges({ idField: 'uid' });
  }

  getAppointmentsByUser(): Observable<Appointment[]> {
    let userUid: User["uid"] = this.authService.currentUserId;
    return this.db.collection<Appointment>('appointments', ref => {
      return ref.where('owner', '==', userUid)
        .orderBy('date', 'desc');
    })
      .valueChanges({ idField: 'uid' });
  }


  async addAppointment(appointment: Appointment) {
    let userUid: User["uid"] = this.authService.currentUserId;

    appointment.owner = userUid;
    appointment.status = status_enum.Agendada;
    appointment.createdAt = new Date();
    appointment.updatedAt = new Date();
    return this.appointmentCollection.add(appointment)
      .then(() => {
        return `Se agendo correctamente su cita`;
      })
      .catch(err => {
        return `Error: ${err}`;
      });
  }

  updateAppointment(appointment: Appointment) {
    appointment.updatedAt = new Date();
    return this.appointmentCollection.doc(appointment.uid).update(appointment);
  }

  deleteAppointment(uid: Appointment['uid']) {
    return this.appointmentCollection.doc(uid).delete();
  }
}
