import { Component } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Appointment } from 'src/app/models/app/appointment';
import { AppointmentService } from 'src/app/services/app/appointment.service';
import { Directory } from '@capacitor/filesystem';

//native
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Http, HttpDownloadFileResult, HttpResponse, } from '@capacitor-community/http';



@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
})
export class AppointmentsPage {

  appointmentSub: Subscription;
  appointments: Appointment[];

  statusColor = { "Agendada": "dark", "Esperando resultados": "tertiary", "Completada": "success", "Cancelada": "danger" };

  downloadProgress = 0;

  constructor(
    private appointmentService: AppointmentService,
    private fileOpener: FileOpener,
    private alertController: AlertController,
    public platform: Platform
  ) { }

  ionViewWillEnter() {
    this.appointmentSub = this.appointmentService.getAppointmentsByUser().subscribe(app => {
      this.appointments = app;
    });
  }

  ionViewWillLeave() {
    this.appointmentSub.unsubscribe();
  }

  get isMobile() {
    return (this.platform.is('android') || this.platform.is('hybrid')) === true
  }

  downloadFile = async (url: string) => {
    let file = this.getFileName(url);
    const name = file[0];
    const mimeType = this.getMimeType(name);

    const options = {
      url: url,
      filePath: name,
      fileDirectory: Directory.Documents,
    };

    // Writes to local filesystem
    const savedFile: HttpDownloadFileResult = await Http.downloadFile(options);
    const path = savedFile.path;

    this.fileOpener.open(path, mimeType)
      .then(() => console.log('File is opened'))
      .catch(e => console.log('Error opening file', e));

  };

  async presentAlert(hdr, msg) {
    const alert = await this.alertController.create({
      header: hdr,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  getFileName(name) {
    var arr = name.match(/.*\/(.*\.(png|jpg|pdf|doc|docs))?.*/);
    return (arr);
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  private getMimeType = (name) => {
    if (name == 'pdf') {
      return 'application/pdf';
    } else if (name == 'png') {
      return 'application/png';
    } else if (name == 'jpg') {
      return 'image/jpeg';
    } else if (name == 'docs') {
      return 'application/msword';
    } else if (name == 'doc') {
      return 'application/msword';
    }
  }
}
