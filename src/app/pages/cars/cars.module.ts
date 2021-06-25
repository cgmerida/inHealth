import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarsPageRoutingModule } from './cars-routing.module';

import { CarsPage } from './cars.page';
import { CarsFormComponent } from './cars-form/cars-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CarsPageRoutingModule
  ],
  declarations: [CarsPage, CarsFormComponent],
  // entryComponents: [CarsFormComponent]
})
export class CarsPageModule {}
