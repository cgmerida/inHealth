import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { Km } from 'src/app/models/app/km';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { Car } from 'src/app/models/app/car';

@Injectable({
  providedIn: 'root'
})
export class CarService {

  private carCollection: AngularFirestoreCollection<Car>;
  // private cars: Observable<Car[]>;
  // private car: Observable<Car>


  constructor(
    private db: AngularFirestore,
    private authService: AuthService
  ) {
    this.carCollection = this.db.collection<Car>('cars');
    // Obtiene todos los carros
    // this.cars = this.carCollection.valueChanges();
  }

  getAllCars() {
    return this.carCollection.valueChanges()
      .pipe(
        switchMap(cars => {
          let userObs = cars.map(
            car => this.db.doc<User>(`/users/${car.owner}`).valueChanges()
          );

          return combineLatest(...userObs, (...users) => {
            cars.forEach((car, index) => {
              car.owner = users[index];
            });
            return cars;
          });
        })
      );
  }

  async getCarsByUser() {
    let uid = await this.authService.getAuthUserUid();
    return this.db.collection<Car>('cars', ref => ref.where('owner', '==', uid)).valueChanges({ idField: 'uid' });
  }

  getCarKm(uid) {
    return this.db.doc<Km>(`/km/${uid}`).valueChanges();
  }

  async addCar(car: Car) {
    car.createdAt = new Date();
    car.updatedAt = new Date();
    car.owner = await this.authService.getAuthUserUid();
    return this.carCollection.add({ ...car })
      .then(() => {
        return `Carro registrado`;
      });
  }

  addKm(km) {
    return new Promise((resolve, reject) => {
      if (km.km <= km.oldKm) {
        reject(`El kilometraje debe ser mayor al registrado anteriormente`);
      } else {
        resolve();
      }
    })
      .then(_ => {
        km.uid = this.db.createId();
        km.createdAt = new Date();
        return this.db.collection<Km>('km').doc(km.uid).set(km)
          .then(() => {
            this.carCollection.doc(km.car).update({ km: km.uid });
            return `Kilometraje registrado.`;
          })
      })
  }

  updateCar(car: Partial<Car>) {
    car.updatedAt = new Date();
    return this.carCollection.doc<Car>(car.uid).update({ ...car });
  }

  deleteCar(uid: Car['uid']) {
    return this.carCollection.doc(uid).delete();
  }

}
