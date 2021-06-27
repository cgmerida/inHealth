import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  constructor(
    private authService: AuthService,
    // private router: Router,
    // private alertCtl: AlertController,
    private loadingController: LoadingController,
    // private errors: ErrorService,
  ) { }


  async logIn(email, password) {
    let loading = await this.loadingController.create();
    await loading.present();

    await this.authService.LogIn(email, password);
    await this.delay(1000);
    await loading.dismiss();
  }

  private delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
}
