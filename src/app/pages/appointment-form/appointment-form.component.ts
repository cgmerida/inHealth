import { Component, Input, OnInit } from '@angular/core';
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
  minDate: Date;

  clicked: boolean;

  // Data passed in by componentProps
  @Input() selectedClinic: Clinic = null;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertCtl: AlertController,
    private clinicService: ClinicService,
    private appointmentService: AppointmentService) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow;

  }

  ngOnInit() {
    this.clinics = this.clinicService.getClinics();

    this.appointmentForm = this.formBuilder.group({
      clinic: [this.selectedClinic, Validators.required],
      specialty: [null, Validators.required],
      date: [null, Validators.required],
    });

    if (this.selectedClinic)
      this.addSpecialties(this.selectedClinic);

    console.log(this.appointmentForm.value);
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

  compareFn(e1: Clinic, e2: Clinic): boolean {
    return e1 && e2 ? e1.uid == e2.uid : e1 == e2;
  }

}
