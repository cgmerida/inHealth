import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Service } from 'src/app/models/service';
import { AlertController, LoadingController } from '@ionic/angular';
import { ServiceService } from 'src/app/services/app/service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage {

  services: Observable<Service[]>;

  servicesForm: FormGroup;
  isSubmitted = false;


  constructor(
    private serviceService: ServiceService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
  ) {

    this.servicesForm = this.formBuilder.group({
      name: [null, Validators.required],
      price: [null, Validators.required],
    });

    this.services = this.serviceService.getServices();
  }

  get errorControl() {
    return this.servicesForm.controls;
  }

  crearServicio() {
    if (!this.servicesForm.valid) {
      return false;
    }

    this.loadingController.create()
      .then(loading => {
        loading.present();
        this.serviceService.addService({ ...this.servicesForm.value })
          .then((res) => {
            this.servicesForm.reset();
            this.presentAlert(`¡Genial!`, res);
          })
          .catch((error) => {
            this.presentAlert(`Error`, `Problema registrando el vehículo. Error: ${error}`);
            console.log(error);
          })
          .finally(() => {
            loading.dismiss();
          });
      });
  }

  actualizarServicio(service, name, price) {
    delete service.msg;
    if (!name && !price) {
      service.msg = `Debe llenar al menos un campo.`;
      return;
    }

    if (price && !/^(\d)+(\.\d{2})?$/.test(price)) {
      service.msg = `El precio no es válido.`;
      return;
    }
    this.loadingController.create()
      .then(loading => {
        loading.present();
        // this.carService.addCar({ ...this.carsForm.value })
        this.serviceService.updateService({
          uid: service.uid,
          name: (name ? name : service.name),
          price: (price ? price : service.price),
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        })
          .then(() => {
            this.presentAlert(`¡Genial!`, `Información Actualizada.`);
          })
          .catch((error) => {
            this.presentAlert(`Error`, `Problema registrando el vehículo. Error: ${error}`);
            console.log(error);
          })
          .finally(() => {
            loading.dismiss();
          });
      });
  }

  eliminar(uid) {
    this.loadingController.create()
      .then(loading => {
        loading.present();
        this.serviceService.deleteService(uid)
          .then(() => {
            this.presentAlert('¡Bien!', 'Carro Eliminado');
          })
          .catch((err) => {
            this.presentAlert('Error', `Hubo un problema.\n Descripcion: ${err}`);
          })
          .finally(() => {
            loading.dismiss();
          });
      });
  }

  

  trackBy(index: number, service: Service) {
    return service.uid;
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
