import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { switchMap, take } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { Car } from 'src/app/models/app/car';
import { Order } from 'src/app/models/app/order';
import { User } from 'src/app/models/user';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderCollection: AngularFirestoreCollection<Order>;

  private orders: Order[] = [];

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private userService: UserService,
  ) {
    this.orderCollection = this.db.collection<Order>('orders');
  }

  getOrders() {
    return this.db.collection<Order>('orders', ref => {
      return ref.orderBy('date', 'desc');
    })
      .valueChanges({ idField: 'uid' })
      .pipe(
        switchMap(orders => {
          let carsObs = orders.map(
            order => this.db.doc<Car>(`cars/${order.car}`).valueChanges()
          );

          if (carsObs.length == 0)
            return of(orders);

          return combineLatest(...carsObs, (...cars) => {
            orders.forEach((order, index) => {
              order.car = cars[index];
            });
            return orders;
          });
        })
      )
      .pipe(
        switchMap(orders => {
          let userObs = orders.map(
            order => this.db.doc<User>(`users/${order.owner}`).valueChanges()
          );

          if (userObs.length == 0)
            return of(orders);

          return combineLatest(...userObs, (...users) => {
            orders.forEach((order, index) => {
              order.owner = users[index];
            });
            return orders;
          });
        })
      )
  }

  async getOnlyOrders(): Promise<Observable<Order[]>> {
    return this.db.collection<Order>('orders', ref => {
      return ref.orderBy('date', 'desc');
    }).valueChanges();
  }

  async getOrdersByUser(): Promise<Observable<Order[]>> {
    let uid: string;
    try {
      uid = await this.authService.getAuthUserUid();
    } catch (err) {
      console.log(err);
      return;
    }

    return this.db.collection<Order>('orders', ref => {
      return ref.where('owner', '==', uid).orderBy('date', 'desc');
    })
      .valueChanges({ idField: 'uid' })
      .pipe(
        switchMap(orders => {
          let carsObs = orders.map(
            order => this.db.doc<Car>(`cars/${order.car}`).valueChanges()
          );

          return combineLatest(...carsObs, (...cars) => {
            orders.forEach((order, index) => {
              order.car = cars[index];
            });
            return orders;
          });
        })
      );

  }


  async getCompletedOrdersByUser(): Promise<Observable<Order[]>> {
    let uid = await this.authService.getAuthUserUid();

    return this.db.collection<Order>('orders', ref => {
      return ref.where('owner', '==', uid)
        .where('status', '==', 'Completado')
        .orderBy('date', 'desc');
    }).valueChanges()
  }


  getCompletedOrders(): Observable<Order[]> {
    return this.db.collection<Order>('orders', ref => {
      return ref.where('status', '==', 'Completado')
        .orderBy('date', 'desc');
    }).valueChanges()
  }


  async addOrder(order: Order) {
    let user = await this.userService.getAuthUser().pipe(take(1)).toPromise();

    if (!user.tel)
      throw `Debe registrar un número de telefono`;

    // order.services

    order.owner = user.uid;
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.status = "Nuevo";
    order.progress = 0;
    return this.orderCollection.add(order)
      .then(() => {
        return `Se registro correctamente su orden`;
      })
      .catch(err => {
        return `Error: ${err}`;
      });
  }

  updateOrder(order: Partial<Order>) {
    order.updatedAt = new Date();
    return this.orderCollection.doc(order.uid).update(order);
  }

  deleteOrder(uid: Order['uid']) {
    return this.orderCollection.doc(uid).delete();
  }
}



  // METODO ESTATICO

  //   this.db.collection<Order>('orders', ref => ref.where('owner', '==', uid)).valueChanges({ idField: 'uid' })
  //   .subscribe(orders => {
  //     orders.forEach(order => {
  //       // this.db.collection<Car>
  //       this.db.doc<Car>(order.car).valueChanges()
  //         .subscribe(car => {
  //           order.car = car;
  //           console.log(JSON.stringify(order));
  //           this.orders.push(order);
  //         })
  //     })
  //   });

  // return this.orders;

  // METODO DINAMICO

  // this.joined$ = this.db.collection<Order>('orders', ref => ref.where('owner', '==', uid)).valueChanges({ idField: 'uid' })
  //     .pipe(
  //       switchMap(orders => {
  //         const carsIds = uniq(orders.map(o => o.car))

  //         return combineLatest(
  //           of(orders),
  //           combineLatest(
  //             carsIds.map(carId =>
  //               this.db.collection<Car>(`cars`, ref => ref.where('uid', '==', carId)).valueChanges()
  //                 .pipe(
  //                   map(cars => cars[0])
  //                 )
  //             )
  //           )
  //         )
  //       }),
  //       map(([orders, cars]) => {

  //         return orders.map(order => {
  //           return {
  //             ...order,
  //             car: cars.find(car => car.uid === order.car.uid)
  //           }
  //         })
  //       })
  //     );

  //   return this.joined$;
