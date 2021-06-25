import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Plugins, StatusBarStyle } from '@capacitor/core';

const { StatusBar } = Plugins;

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage {

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router,
    private userService: UserService,
    private platform: Platform,
  ) {
  }


  ionViewDidEnter() {
    if (this.platform.is('hybrid')) {
      StatusBar.setBackgroundColor({ color: '#079db6' });
      StatusBar.setStyle({ style: StatusBarStyle.Dark });
    }
  }

  async enviarInicio() {

    let loading = await this.loadingController.create()

    loading.present();

    let fireUser = await this.authService.getAuthUser();

    await fireUser.reload();


    await loading.dismiss();


    if (fireUser && fireUser.emailVerified) {
      this.userService.updateUser({
        uid: fireUser.uid,
        emailVerified: fireUser.emailVerified
      })
      this.router.navigate(['/app/inicio']);
    } else {
      this.presentAlert('No has verificado tu correo');
    }
  }

  async enviarCorreo() {

    let loading = await this.loadingController.create()

    loading.present();

    await this.authService.SendVerificationMail();

    await loading.dismiss();
  }

  async presentAlert(msg) {
    const alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: 'Error',
      subHeader: 'Problema válidando correo',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }
}
