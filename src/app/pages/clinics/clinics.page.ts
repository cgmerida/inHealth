import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Clinic } from 'src/app/models/app/clinic';
import { ClinicService } from 'src/app/services/app/clinic.service';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';

@Component({
  selector: 'app-clinics',
  templateUrl: './clinics.page.html',
  styleUrls: ['./clinics.page.scss'],
})
export class ClinicsPage implements OnInit {

  clinics: Observable<Clinic[]>;

  constructor(
    private clinicService: ClinicService,
    private modalController: ModalController,
  ) { }

  async ngOnInit() {
    this.clinics = await this.clinicService.getClinics();
  }


  async agendarCita(clinic: Clinic) {
    let modalConfig = {
      component: AppointmentFormComponent,
      swipeToClose: true,
      cssClass: 'my-modal',
      componentProps: {
        "selectedClinic": clinic,
      }
    }
    const modal = await this.modalController.create(modalConfig);
    await modal.present();
  }

}
