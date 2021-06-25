import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { CarService } from 'src/app/services/app/car.service';
import { Car } from 'src/app/models/app/car';

import { Plugins, CameraResultType, Capacitor, CameraSource } from '@capacitor/core';
import { StorageService } from 'src/app/services/storage.service';
import { ErrorService } from 'src/app/services/error.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

const { Camera } = Plugins;

@Component({
  selector: 'app-cars-form',
  templateUrl: './cars-form.component.html',
  styleUrls: ['./cars-form.component.scss'],
})
export class CarsFormComponent implements OnInit {

  // Data passed in by componentProps
  @Input() update: boolean;
  @Input() car: Car;

  carsForm: FormGroup;
  isSubmitted = false;
  clicked: boolean;

  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;
  photo: SafeResourceUrl;

  isDesktop: boolean = false;

  uploadFile: File | Blob;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private carService: CarService,
    private loadingController: LoadingController,
    private alertCtl: AlertController,
    private storageService: StorageService,
    private errorService: ErrorService,
    private platform: Platform,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit() {

    if (!(this.platform.is('ios') && this.platform.is('android')) || this.platform.is('desktop')) {
      this.isDesktop = true;
    }

    this.carsForm = this.formBuilder.group({
      brand: [this.car ? this.car.brand : null, Validators.required],
      line: [this.car ? this.car.line : null, Validators.required],
      model: [this.car ? this.car.model : null, [Validators.required, Validators.pattern(/^(19[789]|20[012])\d$/)]],
      transmition: [this.car ? this.car.transmition : 'Automatica', [Validators.required, Validators.pattern(/^(Automatica|Mecanica)$/)]],
      color: [this.car ? this.car.color : null, Validators.required],
      license: [this.car ? this.car.license : null, [Validators.required, Validators.pattern(/^(\w{1,3})?\d{3,3}\w{3,3}$/)]]
    });
  }

  dismiss() {
    this.modalController.dismiss();

    // this.modalController.dismiss(DATA);
  }


  async takePicture(type: string) {
    if ((this.isDesktop && type === 'gallery') || !Capacitor.isPluginAvailable('Camera')) {
      this.filePickerRef.nativeElement.click();
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: type === 'camera' ? CameraSource.Camera : CameraSource.Photos
      });

      this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.webPath));

      const file = await fetch(image.webPath).then(r => r.blob());
      this.uploadFile = file;

    } catch (err) {
      this.presentAlert(`Error`, `No se obtuvo foto`, err);
    }
  }



  onFileChoose(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    this.uploadFile = file;

    if (!file.type.match(pattern)) {
      console.log('Archivo no valido');
      return;
    }

    reader.onload = () => {
      this.photo = reader.result.toString();
    };
    reader.readAsDataURL(file);
  }


  get errorControl() {
    return this.carsForm.controls;
  }


  onSubmit() {
    this.isSubmitted = true;
    this.clicked = true;


    if (!this.carsForm.valid) {
      this.clicked = false;
      return false;
    }

    if (this.update) {
      this.actualizar();
    } else {
      this.registrar();
    }

  }

  async getImg() {
    let filename = `${this.carsForm.get("brand").value}_${this.carsForm.get("line").value}`;

    try {
      return await this.storageService.uploadCarImg(this.uploadFile, filename);
    } catch (err) {
      this.presentAlert(`Error`, null, this.errorService.printErrorByCode(err.code));
    }

  }


  async registrar() {
    let loading = await this.loadingController.create();
    await loading.present();
    let downloadImg, res;

    try {
      if (this.uploadFile) {
        downloadImg = await this.getImg();

        res = await this.carService.addCar({ ...this.carsForm.value, photo: downloadImg });
      } else {
        res = await this.carService.addCar({ ...this.carsForm.value });
      }

      await this.presentAlert(`¡Genial!`, null, res);
      this.dismiss();

    } catch (error) {
      this.presentAlert(`Error`, `error: ${error}`, `Problema registrando el vehículo`);
    } finally {

      loading.dismiss();
    }

  }

  async actualizar() {
    let loading = await this.loadingController.create();
    await loading.present();
    let downloadImg, res;

    try {
      if (this.uploadFile) {
        downloadImg = await this.getImg();

        res = await this.carService.updateCar({
          uid: this.car.uid,
          ...this.carsForm.value,
          photo: downloadImg
        });
      } else {
        res = await this.carService.updateCar({
          uid: this.car.uid,
          ...this.carsForm.value,
        });
      }

      this.presentAlert(`¡Genial!`, null, `Información Actualizada.`);
      this.dismiss();

    } catch (error) {
      this.presentAlert(`Error`, null, `Problema actualizando el vehículo`);
    } finally {

      loading.dismiss();
    }
  }

  async deletePhoto() {
    let loading = await this.loadingController.create();
    await loading.present();
    
    this.photo = null;

    try {
      if (this.car.photo) {
        await this.storageService.deleteCarPhoto(this.car.photo);
        this.car.photo = null;
        await this.carService.updateCar({
          uid: this.car.uid,
          photo: null
        });
      }
    } catch (err) {
      this.presentAlert(`Error`, `Problema actualizando el vehículo`, `Descripción del error: ${err}`);
    } finally {
      loading.dismiss();
    }

  }

  changeValue(value) {
    console.log(value);
    this.carsForm.get('transmition').patchValue(value);
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


}
