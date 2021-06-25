import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Service } from 'src/app/models/service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private serviceCollection: AngularFirestoreCollection<Service>;

  // public services: Observable<Service[]>;

  constructor(private db: AngularFirestore) {
    this.serviceCollection = this.db.collection<Service>('services');

  }

  getServices() {
    return this.serviceCollection.valueChanges({ idField: 'uid' });
  }

  addService(service: Service) {
    service.createdAt = new Date();
    service.updatedAt = new Date();
    return this.serviceCollection.add(service)
      .then(() => {
        return `Nuevo servicio creado`;
      })
      .catch(err => {
        return `Error: ${err}`;
      });
  }

  updateService(service: Service) {
    service.updatedAt = new Date();
    return this.serviceCollection.doc(service.uid).update(service);
  }

  deleteService(uid: Service['uid']) {
    return this.serviceCollection.doc(uid).delete();
  }
}
