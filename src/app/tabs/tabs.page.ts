import { Component, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { AppointmentFormComponent } from '../pages/appointment-form/appointment-form.component';

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

  async agendarCita() {
    let modalConfig = {
      component: AppointmentFormComponent,
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
