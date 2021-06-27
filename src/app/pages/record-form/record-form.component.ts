import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { RecordService } from 'src/app/services/app/record.service';
import { ErrorService } from 'src/app/services/error.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-record-form',
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.scss'],
  providers: [DatePipe]
})
export class RecordFormComponent implements OnInit {

  recordForm: FormGroup;
  clicked: boolean;

  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;
  document: SafeResourceUrl;

  uploadFile: File;
  fileExt: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertCtl: AlertController,
    private recordService: RecordService,
    private storageService: StorageService,
    private errorService: ErrorService,
    private platform: Platform,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer) {
  }

  get isDesktop(): boolean {
    if (!(this.platform.is('ios') && this.platform.is('android')) || this.platform.is('desktop')) {
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.recordForm = this.formBuilder.group({
      name: [null, Validators.required],
    });
  }

  get errorControl() {
    return this.recordForm.controls;
  }

  uploadDoc(type: string) {
    if (this.isDesktop) {
      this.filePickerRef.nativeElement.click();
      return;
    }
  }


  onFileChoose(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /(image\/jpg|image\/jpeg|image\/png|application\/pdf|application\/msword)/;
    const reader = new FileReader();

    let ext = this.getExt(file.name);

    if (!file.type.match(pattern) && this.checkExt(ext)) {
      this.presentAlert('Error al subir archivo', 'Tipo de archivo no valido', `tipo de archivo: ${file.type}. extension: ${ext}`);
      return;
    }

    this.uploadFile = file;
    this.fileExt = ext;

    if (['png', 'jpg'].includes(ext)) {
      reader.onload = () => {
        this.document = reader.result.toString();
      };
      reader.readAsDataURL(file);
    }
  }


  async deleteDoc() {
    let loading = await this.loadingController.create();
    await loading.present();

    this.uploadFile = null;
    this.document = null;

    loading.dismiss();
  }

  onSubmit() {
    this.clicked = true;
    if (!this.recordForm.valid) {
      return false;
    }

    if (!this.uploadFile) {
      return false;
    }
    this.registrar();
  }

  async registrar() {
    let loading = await this.loadingController.create();
    await loading.present();

    let res;
    let record = this.recordForm.value;

    try {
      record.url = await this.getImg();
      res = await this.recordService.addRecord(record);
      await this.presentAlert(`¡Genial!`, null, res);
      this.dismiss();
    } catch (error) {
      this.presentAlert(`Error`, `error: ${error}`, `Problema creando el recurso`);
    } finally {
      loading.dismiss();
    }
  }

  async getImg() {
    let date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    let filename = `${this.recordForm.get("name").value}_${date}.${this.fileExt}`;

    try {
      return await this.storageService.uploadRecord('records', filename, this.uploadFile);
    } catch (err) {
      this.presentAlert(`Error`, null, this.errorService.printErrorByCode(err.code));
    }

  }

  private getExt(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  private checkExt(ext) {
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'pdf':
      case 'doc':
      case 'docs':
        return true;
    }
    return false;

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