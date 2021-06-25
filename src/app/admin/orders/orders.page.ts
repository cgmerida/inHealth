import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { Order } from 'src/app/models/app/order';
import { OrderService } from 'src/app/services/app/order.service';
import { OrdersFormComponent } from '../orders-form/orders-form.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage {

  orders: Observable<Order[]>;
  orderCompleted = false;

  statusColor = { "Nuevo": "dark", "En Progreso": "tertiary", "Completado": "success", "Cancelado": "danger" };

  constructor(
    private loadingController: LoadingController,
    private orderService: OrderService,
    private alertCtl: AlertController,
    private modalController: ModalController
  ) {
    this.orders = this.orderService.getOrders();
  }

  async segmentChanged(ev) {
    const loading = await this.loadingController.create();

    await loading.present();

    if (ev.detail.value == 'completados') {
      this.orderCompleted = true;
    } else {
      this.orderCompleted = false;
    }

    await loading.dismiss();
  }

  async orderStatus(orderUid, newStatus) {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await this.orderService.updateOrder({
        uid: orderUid,
        status: newStatus
      })

      this.presentAlert('¡Genial!', `Se actualizó el estado de la orden a ${newStatus}`);

    } catch (error) {
      this.presentAlert('Error', error);
      console.log(error);

    } finally {
      await loading.dismiss();
    }
  }


  async tracing(order: Order) {
    let modalConfig = {
      component: OrdersFormComponent,
      swipeToClose: true,
      cssClass: 'my-modal',
      componentProps: {
        'order': order
      }
    }
    const modal = await this.modalController.create(modalConfig);
    await modal.present();
  }

  sumTotal(order: Order) {
    let total = 0;
    order.services.forEach(service => {
      total += Math.round(service.price * 100) / 100;
      if (service.hasOwnProperty('products') && service.products.length > 0) {
        service.products.forEach(product => {
          total += Math.round(product.price * 100) / 100;
        });
      }
    });

    return total;
  }


  trackBy(index: number, order: Order) {
    return order.uid;
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
