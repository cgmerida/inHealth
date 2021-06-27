import { Component } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Appointment } from 'src/app/models/app/appointment';
import { AppointmentService } from 'src/app/services/app/appointment.service';

//native
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient } from '@angular/common/http';
import { Filesystem, FilesystemDirectory } from '@capacitor/core';


@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
})
export class AppointmentsPage {
  appointments: Appointment[];

  statusColor = { "Agendada": "dark", "Esperando resultados": "tertiary", "Completada": "success", "Cancelada": "danger" };

  downloadProgress = 0;

  constructor(
    private appointmentService: AppointmentService,
    private fileOpener: FileOpener,
    private alertController: AlertController,
    public platform: Platform,
    private http: HttpClient
  ) {
    this.appointmentService.getAppointmentsByUser().subscribe(app => {
      this.appointments = app;
    });
  }

  get isMobile() {
    return (this.platform.is('android') || this.platform.is('hybrid')) === true
  }

  downloadFile = async (url: string) => {
    console.log(`entro a descargas`);
    let file = this.getFileName(url);
    const name = file[0];
    const mimeType = this.getMimeType(name);

    this.http.get(url, {
      responseType: 'blob',
    })
      .subscribe(async (resp) => {
        console.log("resp");
        console.log(resp);
        const base64Data = await this.convertBlobToBase64(resp) as string;

        let savedFile = await Filesystem.writeFile({
          path: name,
          data: base64Data,
          directory: FilesystemDirectory.Documents
        });
        
        console.log("img saved");
        console.log(savedFile);

        this.fileOpener.open(savedFile.uri, mimeType)
          .then(() => console.log('File is opened'))
          .catch(e => console.log('Error opening file', e));
      });


    //   this.http.get('http://ionic.io', {}, {})
    //     .then(data => {
    //       console.log(data.status);
    //       console.log(data.data); // data received by server
    //       console.log(data.headers);

    //     })
    //     .catch(error => {

    //       console.log(error.status);
    //       console.log(error.error); // error message as string
    //       console.log(error.headers);

    //     });
    //   this.fileOpener.open(path, mimeType)
    //     .then(() => console.log('File is opened'))
    //     .catch(e => console.log('Error opening file', e));

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
