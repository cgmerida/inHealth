import { Component, OnDestroy, OnInit } from '@angular/core';

import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { Order } from 'src/app/models/app/order';
import { OrderService } from 'src/app/services/app/order.service';
import { CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})
export class ExpensesPage implements OnInit, OnDestroy {

  private months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  barChartOptions: ChartOptions = {
    responsive: true,
    responsiveAnimationDuration: 1000,
    aspectRatio: 1.7,
    scales: {
      xAxes: [{
        gridLines: {
          display: false
        },
        stacked: true
      }],
      yAxes: [{
        display: false,
        stacked: true
      }]
    }
  };


  chartColors = [
    {
      backgroundColor: function (context) {
        var i = context.dataIndex;
        // var value = context.dataset.data[i];
        return i % 2 ? 'rgba(7,157,182,.5)' : 'rgba(82,96,255,.5)';
      }
    },
  ];

  barChartLegend = false;
  // barChartPlugins = [];

  barChartLabels: Label[] = [];
  // barChartLabels: Label[] = ['Apple', 'Banana', 'Kiwifruit', 'Blueberry', 'Orange', 'Grapes'];

  barChartType: ChartType = 'bar';

  barChartData: ChartDataSets[] = [];
  // barChartData: ChartDataSets[] = [
  //   { data: [45, 37, 60], label: 'Best Fruits' },
  //   { data: [45, 37, 60], label: 'Best Fruits 2' },
  //   { data: [45, 37, 60], label: 'Best Fruits 3' }
  // ];

  private orderSub: Subscription;
  orders: Order[];

  chartReady = false;

  constructor(
    private orderService: OrderService,
    private currencyPipe: CurrencyPipe,
  ) {

    let ccy = this.currencyPipe;

    this.barChartOptions.tooltips = {
      enabled: true,
      callbacks: {
        label: function (tooltipItems, data) {
          let n = data.datasets[0].data[tooltipItems.index];
          return ccy.transform(n, 'GTQ', 'symbol-narrow');
        }
      }
    };

  }



  ngOnInit() {
    this.orderService.getCompletedOrdersByUser().then(orders$ => {
      this.orderSub = orders$.subscribe(orders => {
        this.orders = orders;
        this.createBarChart();
        this.chartReady = true;
      })
    });
  }

  createBarChart() {
    let mesesLabel: Label[] = [];
    let dataSet: ChartDataSets[] = [];
    let data = [];
    let ordersSorted = Array.from(this.orders);
    // let data: string[] = [];

    ordersSorted.reverse().forEach((order) => {
      let monthNum = order.date.toDate().getMonth();
      if (!mesesLabel.includes(this.months[monthNum]))
        mesesLabel.push(this.months[monthNum]);

      let total = this.sumTotal(order);

      data[monthNum] = data[monthNum] != undefined ? data[monthNum] += total : total;
    });

    data = data.filter(i => i != null);

    dataSet.push({ data });

    this.barChartLabels = mesesLabel;
    this.barChartData = dataSet;
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

  ngOnDestroy() {
    this.orderSub.unsubscribe();
  }

}
