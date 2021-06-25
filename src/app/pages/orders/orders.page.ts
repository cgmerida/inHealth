import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { OrderService } from 'src/app/services/app/order.service';
import { Order } from 'src/app/models/app/order';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage {

  // orders: Observable<Order[]>;
  orderSub: Subscription;
  orders: Order[];

  statusColor = { "Nuevo": "dark", "En Progreso": "tertiary", "Completado": "success", "Cancelado": "danger" };

  constructor(private orderService: OrderService) {

  }

  ionViewWillEnter() {
    this.orderService.getOrdersByUser()
      .then(orders$ => {
        this.orderSub = orders$.subscribe(orders => {
          this.orders = orders;
        })
      });
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

  ionViewWillLeave() {
    this.orderSub.unsubscribe();
  }

}
