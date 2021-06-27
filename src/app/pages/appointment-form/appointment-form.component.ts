import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';


import { ClinicService } from 'src/app/services/app/clinic.service';
import { Clinic } from 'src/app/models/app/clinic';

import { Observable } from 'rxjs';
import { AppointmentService } from 'src/app/services/app/appointment.service';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
})
export class AppointmentFormComponent implements OnInit {

  appointmentForm: FormGroup;
  clinics: Observable<Clinic[]>;
  specialties: Clinic["specialties"];
  minDate = new Date().toDateString();

  clicked: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertCtl: AlertController,
    private clinicService: ClinicService,
    private appointmentService: AppointmentService) {

    this.appointmentForm = this.formBuilder.group({
      clinic: [null, Validators.required],
      specialty: [null, Validators.required],
      date: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.clinics = this.clinicService.getClinics();
  }

  addSpecialties(c: Clinic) {
    this.specialties = c.specialties;
  }

  get errorControl() {
    return this.appointmentForm.controls;
  }


  onSubmit() {
    this.clicked = true;
    if (!this.appointmentForm.valid) {
      return false;
    }
    this.registrar();
  }

  async registrar() {
    let appointment = this.appointmentForm.value;
    appointment.clinic = {
      uid: appointment.clinic.uid,
      name: appointment.clinic.name
    };

    this.loadingController.create()
      .then(loading => {
        loading.present();
        appointment.date = new Date(appointment.date);

        this.appointmentService.addAppointment(appointment)
          .then((res) => {
            this.presentAlert(`¡Genial!`, null, res);
            this.dismiss();
          })
          .catch((error) => {
            this.presentAlert(`Error`, `${error}`, `Problema registrando la orden.`);
          })
          .finally(() => {
            this.clicked = true;
            loading.dismiss();
          });
      });
  }



  async presentAlert(hdr, shdr, msg) {
    const alert = await this.alertCtl.create({
      header: hdr,
      subHeader: shdr,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }




  dismiss() {
    this.modalController.dismiss();
  }


}
