import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CarsFormComponent } from './cars-form/cars-form.component';
import { CarService } from 'src/app/services/app/car.service';
import { Car } from 'src/app/models/app/car';
import { Km } from 'src/app/models/app/km';
import { Observable, of, zip } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { flatMap, } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.page.html',
  styleUrls: ['./cars.page.scss'],
})
export class CarsPage implements OnInit {

  cars: Observable<Car[]>;

  constructor(
    private modalController: ModalController,
    private carService: CarService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private storageService: StorageService,
  ) {

  }

  async ngOnInit() {
    this.cars = (await this.carService.getCarsByUser()).pipe(
      flatMap(cars => {

        let kmObs: Observable<Km>[] = [];
        cars.forEach(car => {
          if (!!car.km) {
            kmObs.push(this.carService.getCarKm(car.km));
          }
        });

        if (kmObs.length == 0)
          return of(cars);

        return combineLatest(...kmObs, (...km: Km[]) => {
          cars.forEach((car) => {
            if (!!car.km) {
              let index = km.findIndex(km => km.car === car.uid);
              car.km = index !== -1 ? km[index] : null;
            }
          });
          return cars;
        });
      })
    );


  }


  km(car) {
    car.addKm = true
  }

  onSubmitKm(car, km) {
    const kmInt = parseInt(km);
    console.log(kmInt);

    if (!kmInt || kmInt <= 0) {
      this.presentAlert('Error', `Ingrese un Kilometraje válido`);
      return false;
    }

    this.loadingController.create()
      .then(loading => {
        loading.present();

        this.carService.addKm({
          km: km,
          car: car.uid,
          oldKm: (!!car.km ? car.km.km : 0)
        })
          .then((res) => {
            this.presentAlert('¡Bien!', res);
          })
          .catch((err) => {
            this.presentAlert('Error', `${err}`);
          })
          .finally(() => {
            loading.dismiss();
            car.addKm = false
          });
      })
  }


  editar(car: Car) {
    this.presentModal(true, car);
  }

  async eliminar(uid, url) {
    let loading = await this.loadingController.create();

    await loading.present();

    try {
      await this.carService.deleteCar(uid);
      if (url) {
        await this.storageService.deleteCarPhoto(url);
      }
      this.presentAlert('¡Bien!', 'Carro Eliminado');
    } catch (err) {
      this.presentAlert('Error', `Hubo un problema.\n Descripcion: ${err}`);
    } finally {
      loading.dismiss();
    }

  }

  trackBy(i: number, car: Car) {
    return car.uid;
  }

  async presentModal(update = false, car = null) {
    let modalConfig = {
      component: CarsFormComponent,
      swipeToClose: true,
      cssClass: 'my-modal',
      componentProps: {
        'update': update,
        'car': car
      }
    }
    const modal = await this.modalController.create(modalConfig);
    await modal.present();
  }


  async presentAlert(hdr, msg) {
    const alert = await this.alertController.create({
      header: hdr,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

}
