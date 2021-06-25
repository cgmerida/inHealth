import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdersPageRoutingModule } from './orders-routing.module';

import { OrdersPage } from './orders.page';
import { IonicRatingModule } from 'ionic-rating';
import { OrdersFormComponent } from '../orders-form/orders-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersPageRoutingModule,
    IonicRatingModule,
  ],
  declarations: [OrdersPage, OrdersFormComponent]
})
export class OrdersPageModule { }
