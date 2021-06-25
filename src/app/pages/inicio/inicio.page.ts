import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/app/order.service';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit, OnDestroy {

  // private slideOpts = {
  //   slidesPerView: 1.5,
  //   loop: true,
  //   centeredSlides: true,
  //   spaceBetween: 10
  // };

  private orderSub: Subscription;

  user: Observable<User>;

  totalOrders = 0;
  loading = true;
  totalExpenses = 0;

  constructor(
    private orderServcice: OrderService,
    private userService: UserService,
  ) {
    this.user = this.userService.getAuthUser();
  }

  ngOnInit() {
    this.loading = true;
    this.orderServcice.getCompletedOrdersByUser().then(orders$ => {
      this.orderSub = orders$.subscribe(orders => {
        this.totalOrders = 0;
        this.totalExpenses = 0;

        orders.forEach(order => {
          this.totalOrders++;
          order.services.forEach(service => {
            this.totalExpenses += Math.round(service.price * 100) / 100;
            if (service.hasOwnProperty('products') && service.products.length > 0) {
              service.products.forEach(product => {
                this.totalExpenses += Math.round(product.price * 100) / 100;
              });
            }
          })
        })
      });

      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.orderSub.unsubscribe();
  }

}
