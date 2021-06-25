import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminTabsPage } from './admin-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: AdminTabsPage,
    children: [
      {
        path: 'inicio',
        loadChildren: () => import('../admin/inicio/inicio.module').then(m => m.InicioPageModule)
      },
      {
        path: 'cars',
        loadChildren: () => import('../admin/cars/cars.module').then(m => m.CarsPageModule),
      },
      {
        path: 'services',
        loadChildren: () => import('../admin/services/services.module').then(m => m.ServicesPageModule)
      },
      {
        path: 'products',
        loadChildren: () => import('../admin/products/products.module').then(m => m.ProductsPageModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('../admin/orders/orders.module').then(m => m.OrdersPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('../pages/profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'users',
        loadChildren: () => import('../admin/users/users.module').then(m => m.UsersPageModule)
      },
      {
        path: '',
        redirectTo: '/admin/inicio',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/admin/inicio',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminTabsPageRoutingModule { }
