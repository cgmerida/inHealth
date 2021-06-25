import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from 'src/app/services/app/order.service';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet, monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend } from 'ng2-charts';
import { Order } from 'src/app/models/app/order';
import { ResponseService } from 'src/app/services/response.service';
import { Response } from 'src/app/models/app/responses';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit, OnDestroy {

  private orders: Order[];
  responses: Response[] = [];

  // ORDENES X STATUS CHART
  pieChartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1.7,
  };
  pieChartLabels: Label[] = ['Nuevo', 'En Progreso', 'Completado', 'Cancelado'];
  pieChartData: SingleDataSet = [];
  pieChartType: ChartType = 'pie';
  pieChartLegend = true;
  pieChartColors = [
    {
      backgroundColor: (context) => {
        let i = context.dataIndex;
        // let value = context.dataset.data[i];
        let label = context.chart.config.data.labels[i];
        let color = {
          'Nuevo': 'rgba(82, 96, 255,.5)',
          'En Progreso': 'rgba(2, 2, 62,.5)',
          'Completado': 'rgba(45, 211, 111,.5)',
          'Cancelado': 'rgba(235, 68, 90,.5)'

        };
        return color[label];
      }
    },
  ];


  // GENERAL BAR CHART
  orderChartReady = false;
  barChartType: ChartType = 'bar';
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

  // GASTOS X MES
  private months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo",
    "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];


  expensesChartLabels: Label[] = [];
  expensesChartType: ChartType = 'bar';
  expensesChartLegend = false;
  expensesChartData: SingleDataSet = [];
  expensesChartColors = [
    {
      backgroundColor: function (context) {
        var i = context.dataIndex;
        return i % 2 ? 'rgba(7,157,182,.5)' : 'rgba(82,96,255,.5)';
      }
    },
  ];


  // SERVICIOS
  servicesChartLabels: Label[] = [];
  servicesChartData: SingleDataSet = [];
  servicesChartLegend = false;

  chartColors = [{
    backgroundColor: [
      'rgba(2,2,62,.5)', 'rgba(7,157,182,.5)', 'rgba(82,96,255,.5)',
      'rgba(45,211,111,.5)', 'rgba(235,68,90,.5)',
    ]
  }];

  // PRODUCTS
  productsChartLabels: Label[] = [];
  productsChartData: SingleDataSet = [];
  productsChartLegend = false;


  private orderSub: Subscription;
  private resSub: Subscription;


  constructor(
    private orderServcice: OrderService,
    private responseService: ResponseService,
  ) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {
    this.getAvgRating();

    this.orderServcice.getOnlyOrders()
      .then(orders$ => {
        this.orderSub = orders$.subscribe(orders => {
          this.orders = orders;
          this.ordersChart();
        });
      });

  }


  getAvgRating() {
    this.resSub = this.responseService.getResponses()
      .subscribe(orderResp => {

        this.responses = [];
        
        orderResp.forEach(resp => {
          resp.responses.forEach(r => {
            // Mapear todo el rating
            let i = this.responses.findIndex((resp => resp.question == r.question));
            if (i !== -1) {
              this.responses[i].rating += r.rating;
            } else {
              this.responses.push(r);
            }
          })
        })
        // Obtener rating promedio
        this.responses = this.responses.map(resp => {
          resp.rating = 5 * (resp.rating / (5 * orderResp.length))
          return resp;
        });

      });
  }

  ordersChart() {
    let orders = Array.from(this.orders);

    // Datos status
    let pieDataSchema = {
      'Nuevo': 0,
      'En Progreso': 0,
      'Completado': 0,
      'Cancelado': 0
    };

    // Datos expenses
    let expenses: { [key: string]: number } = {};

    // Datos servicios
    let servicios: { [key: string]: number } = {};

    // Datos Productos
    let productos: { [key: string]: number } = {};

    orders.reverse().forEach((order) => {
      // Obtener no. de ordenes por status
      pieDataSchema[order.status]++;

      // Obtener gastos de ordenes
      if (order.status == 'Completado') {
        let monthNum = order.date.toDate().getMonth();
        if (!expenses.hasOwnProperty(this.months[monthNum])) {
          expenses[this.months[monthNum]] = 0;
        }
        expenses[this.months[monthNum]] += this.sumTotal(order);
      }

      // Obtener servicios
      order.services.forEach(service => {
        if (!servicios.hasOwnProperty(service.name)) {
          servicios[service.name] = 0;
        }
        servicios[service.name]++;

        // obtener conteo productos
        if (service.products) {
          service.products.forEach(product => {
            if (!productos.hasOwnProperty(product.name)) {
              productos[product.name] = 0;
            }
            productos[product.name]++;
          });
        }
      })
    });


    // EXPENSES X MONTH
    this.expensesChartLabels = Object.keys(expenses);
    this.expensesChartData = Object.values(expenses);

    // ORDERS X STATUS
    this.pieChartData = Object.values(pieDataSchema);

    // Servicios
    this.servicesChartLabels = Object.keys(servicios);
    this.servicesChartData = Object.values(servicios);

    // Productos
    this.productsChartLabels = Object.keys(productos);
    this.productsChartData = Object.values(productos);

    this.orderChartReady = true;
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
    this.resSub.unsubscribe();
  }

}
