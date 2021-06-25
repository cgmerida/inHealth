import { Component, OnInit, Input } from '@angular/core';
import { Order } from 'src/app/models/app/order';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { OrderService } from 'src/app/services/app/order.service';
import { ProductService } from 'src/app/services/product.service';
import { ServiceService } from 'src/app/services/app/service.service';
import { Observable } from 'rxjs';
import { Product } from 'src/app/models/app/product';
import { Service } from 'src/app/models/service';

@Component({
  selector: 'app-orders-form',
  templateUrl: './orders-form.component.html',
  styleUrls: ['./orders-form.component.scss'],
})
export class OrdersFormComponent implements OnInit {

  @Input() order: Order;

  products: Observable<Product[]>;
  services: Observable<Service[]>;

  constructor(
    private modalController: ModalController,
    private alertCtl: AlertController,
    private orderService: OrderService,
    private productService: ProductService,
    private serviceService: ServiceService,
    private loadingController: LoadingController,
  ) {
    // https://stackblitz.com/edit/nested-list?file=src%2Fapp%2Fapp.component.ts
    this.services = this.serviceService.getServices();
    this.products = this.productService.getProducts();
  }

  ngOnInit() {
  }

  progressChange(ev) {
    this.order.progress = ev.detail.value;
  }

  async addService(newService) {
    if (!this.order.services.some(service => service.uid == newService.uid)) {
      this.order.services.push(newService);
    } else {
      this.presentAlert('Error', `El servicio ${newService.name} ya se encuentra en esta order.`);
    }
  }

  async addProduct(serviceUid, newProduct) {
    if (!this.filterBySearch(serviceUid, newProduct.uid)) {
      this.order.services.forEach((service, i) => {
        if (service.uid == serviceUid) {
          if (service.products) {
            this.order.services[i].products.push(newProduct);
          } else {
            this.order.services[i].products = [newProduct];
          }
        }
      });

    } else {
      this.presentAlert('Error', `El producto ${newProduct.name} ya se encuentra en esta order.`);
    }
  }

  filterBySearch(serviceUid, productUid) {
    return this.order.services
      .filter(service => {
        if (service.uid == serviceUid) {
          if (!service.products) {
            return false;
          }
          return service.products.some(product => product.uid == productUid);
        }
      }).length > 0;
  }

  delService(serviceUid) {
    this.order.services.splice(this.order.services.findIndex(service => service.uid === serviceUid), 1)
  }

  delProduct(serviceUid, productUid) {
    this.order.services.forEach(service => {
      if (service.uid === serviceUid) {
        service.products.splice(
          service.products.findIndex(product => product.uid === productUid)
          , 1)
      }
    })
  }


  async updateOrder() {

    const loading = await this.loadingController.create();
    await loading.present();

    this.order.services.forEach((service) => {
      delete service.addProducts;
    });

    try {
      await this.orderService.updateOrder({
        uid: this.order.uid,
        progress: this.order.progress,
        status: this.order.progress == 100 ? 'Completado' : this.order.status,
        services: this.order.services
      });

      this.presentAlert('¡Genial!', `Se actualizó correctamente.`);

    } catch (error) {
      this.presentAlert('Error', error);

    } finally {
      await loading.dismiss();
      this.dismiss();
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async presentAlert(hdr, msg) {
    const alert = await this.alertCtl.create({
      header: hdr,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }
}
