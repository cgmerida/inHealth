import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpensesPageRoutingModule } from './expenses-routing.module';

import { ExpensesPage } from './expenses.page';
import { ChartsModule } from 'ng2-charts';
import { CurrencyPipe } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpensesPageRoutingModule,
    ChartsModule
  ],
  providers: [CurrencyPipe],
  declarations: [ExpensesPage]
})
export class ExpensesPageModule { }
