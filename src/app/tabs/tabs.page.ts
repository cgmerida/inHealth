import { Component, OnDestroy } from '@angular/core';
import { OrderFormComponent } from '../pages/order-form/order-form.component';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { User } from '../models/user';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnDestroy {

  private userSub: Subscription;
  user: User;

  constructor(
    private modalController: ModalController,
    private userService: UserService,
  ) {

    this.userSub = this.userService.getAuthUser().subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  async registrarOrden() {
    let modalConfig = {
      component: OrderFormComponent,
      swipeToClose: true,
      cssClass: 'my-modal',
    }
    const modal = await this.modalController.create(modalConfig);
    await modal.present();
  }


  ngOnDestroy() {
    this.userSub.unsubscribe();
  }


}
