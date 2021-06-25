import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CarService } from 'src/app/services/app/car.service';
import { Observable } from 'rxjs';
import { Car } from 'src/app/models/app/car';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.page.html',
  styleUrls: ['./cars.page.scss'],
})
export class CarsPage implements OnInit {

  cars: Observable<Car[]>

  constructor(
    private modalController: ModalController,
    private carService: CarService
  ) { }

  ngOnInit() {
    this.cars = this.carService.getAllCars();
  }


  trackBy(index: number, car: Car) {
    return car.uid;
  }

  
  // async presentModal() {
  //   const modal = await this.modalController.create({
  //     component: ModalPage,
  //     cssClass: 'my-custom-class'
  //   });
  //   return await modal.present();
  // }

}
