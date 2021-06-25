import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FirstGuard } from './guards/first.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminRedirectGuard } from './guards/adminRedirect.guard';

import { canActivate, AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { redirectLoggedInToInicio, redirectOrVerifyEmail, redirectVerified } from './app-guards';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomePageModule),
    canActivate: [FirstGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule),
    ...canActivate(redirectLoggedInToInicio)
  },
  {
    path: 'login/forgot',
    loadChildren: () => import('./auth/forgot/forgot.module').then(m => m.ForgotPageModule),
    ...canActivate(redirectLoggedInToInicio)
  },
  {
    path: 'register',
    loadChildren: () => import('./auth/register/register.module').then(m => m.RegisterPageModule),
    ...canActivate(redirectLoggedInToInicio)
  },
  {
    path: 'verify-email',
    loadChildren: () => import('./auth/verify-email/verify-email.module').then(m => m.VerifyEmailPageModule),
    ...canActivate(redirectVerified)
  },
  {
    path: 'app',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AngularFireAuthGuard, AdminRedirectGuard],
    data: { authGuardPipe: redirectOrVerifyEmail }
  },
  {
    path: 'rating/:orderId',
    loadChildren: () => import('./pages/rating/rating.module').then(m => m.RatingPageModule),
    ...canActivate(redirectOrVerifyEmail)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin-tabs/admin-tabs.module').then(m => m.AdminTabsPageModule),
    canActivate: [AngularFireAuthGuard, AdminGuard],
    data: { authGuardPipe: redirectOrVerifyEmail }
  },
  {
    path: '404',
    loadChildren: () => import('./notfound/notfound.module').then(m => m.NotfoundPageModule)
  },
];

// {
//   path: '**',
//   redirectTo: '/404',
//   pathMatch: 'full'
// },

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
