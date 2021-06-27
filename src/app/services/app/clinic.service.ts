import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Clinic } from 'src/app/models/app/clinic';


@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  private clinicCollection: AngularFirestoreCollection<Clinic>;

  constructor(private db: AngularFirestore) {

    this.clinicCollection = this.db.collection<Clinic>('clinics');
  }

  getClinics() {
    return this.clinicCollection.valueChanges({ idField: 'uid' });
  }

  addClinic(clinic: Clinic) {
    clinic.createdAt = new Date();
    clinic.updatedAt = new Date();
    return this.clinicCollection.add(clinic)
      .then(() => {
        return `Nueva clinica registrada`;
      })
      .catch(err => {
        return `Error: ${err}`;
      });
  }

  updateClinic(clinic: Clinic) {
    clinic.updatedAt = new Date();
    return this.clinicCollection.doc(clinic.uid).update(clinic);
  }

  deleteClinic(uid: Clinic['uid']) {
    return this.clinicCollection.doc(uid).delete();
  }
}

