import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Appointment } from 'src/app/models/app/appointment';
import { AppointmentService } from 'src/app/services/app/appointment.service';

//native
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

//Capacitor
import { Plugins, FilesystemDirectory } from '@capacitor/core';
import { getFileReader } from 'src/app/utils/utils';
const { Filesystem } = Plugins;

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
})
export class AppointmentsPage implements OnInit {

  appointments: Observable<Appointment[]>;
  statusColor = { "Agendada": "dark", "Esperando resultados": "tertiary", "Completada": "success", "Cancelada": "danger" };

  constructor(
    private appointmentService: AppointmentService,
    private fileOpener: FileOpener,
    private alertController: AlertController,
    public platform: Platform,
    private http: HttpClient
  ) {
  }

  ngOnInit() {
    this.appointments = this.appointmentService.getAppointmentsByUser();
  }

  get isMobile() {
    return this.platform.is('hybrid');
  }

  downloadFile = async (url: string) => {
    let file = this.getFileName(url);
    const name = file[1];
    const mimeType = this.getMimeType(name);

    let resp = await this.http.get(url, {
      responseType: "blob"
    }).toPromise();

    let base64String = await this.convertBlobToBase64(resp) as string;

    try {

      let savedFile = await Filesystem.writeFile({
        path: name,
        data: base64String,
        directory: FilesystemDirectory.Documents
      });

      this.fileOpener.open(savedFile.uri, mimeType)
        .then(() => console.log('File is opened'))
        .catch(e => console.log('Error opening file', e));

    } catch (e) {
      this.presentAlert("Error", `Error al abrir archivo ${e}.`);
    }

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
    let arr = name.match(/.*\/(.*\.(png|jpg|pdf|doc|docs))?.*/);
    return (arr);
  }

  private convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = getFileReader();
    reader.onerror = reject;
    reader.onload = (imgsrc) => {
      resolve((imgsrc.target as FileReader).result);
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
  };
}
