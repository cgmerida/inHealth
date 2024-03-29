import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  user: Observable<User>;

  totalOrders = 0;
  loading = true;
  totalExpenses = 0;

  constructor(
    private userService: UserService,
  ) {
    this.user = this.userService.getAuthUser();
  }

  ngOnInit() {
    this.loading = false;
    // this.orderServcice.getCompletedOrdersByUser().then(orders$ => {
    //   this.orderSub = orders$.subscribe(orders => {
    //     this.totalOrders = 0;
    //     this.totalExpenses = 0;

    //     orders.forEach(order => {
    //       this.totalOrders++;
    //       order.services.forEach(service => {
    //         this.totalExpenses += Math.round(service.price * 100) / 100;
    //         if (service.hasOwnProperty('products') && service.products.length > 0) {
    //           service.products.forEach(product => {
    //             this.totalExpenses += Math.round(product.price * 100) / 100;
    //           });
    //         }
    //       })
    //     })
    //   });

    //   this.loading = false;
    // });
  }

}
