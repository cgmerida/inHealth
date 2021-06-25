import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingController, Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';

const { StatusBar } = Plugins;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private authService: AuthService,
    // private router: Router,
    // private alertCtl: AlertController,
    private loadingController: LoadingController,
    // private errors: ErrorService,
    private platform: Platform,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {

    if (this.platform.is('hybrid')) {
      StatusBar.setBackgroundColor({ color: '#02023e' });
      StatusBar.setStyle({ style: StatusBarStyle.Dark });
    }
  }


  async logIn(email, password) {

    let loading = await this.loadingController.create();
    await loading.present();

    await this.authService.LogIn(email, password);

    await loading.dismiss();
  }

  async authGoogle() {

    let loading = await this.loadingController.create();
    await loading.present();

    await this.authService.GoogleAuth();

    await loading.dismiss();

  }

  async authFb() {

    let loading = await this.loadingController.create();
    await loading.present();

    await this.authService.FacebookAuth();

    await loading.dismiss();

  }

  // async presentAlert(msg) {
  //   const alert = await this.alertCtl.create({
  //     // cssClass: 'my-custom-class',
  //     header: 'Error',
  //     subHeader: 'Problema iniciando sesión.',
  //     message: msg,
  //     buttons: ['OK']
  //   });

  //   await alert.present();
  // }

}
