import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { Observable } from 'rxjs';
import { Record } from 'src/app/models/app/record';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { RecordFormComponent } from '../record-form/record-form.component';
import { RecordService } from 'src/app/services/app/record.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { HttpClient } from '@angular/common/http';
import { Plugins, FilesystemDirectory } from '@capacitor/core';
import { getFileReader } from 'src/app/utils/utils';
import { StorageService } from 'src/app/services/storage.service';

const { Filesystem } = Plugins;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: User;
  userEdit: Partial<User>;
  update: boolean = false;
  records: Observable<Record[]>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private recordService: RecordService,
    private modalController: ModalController,
    private platform: Platform,
    private loadingController: LoadingController,
    private fileOpener: FileOpener,
    private alertController: AlertController,
    private http: HttpClient,
    private storageService: StorageService
  ) {
  }
  ngOnInit(): void {
    this.userService.getAuthUser().subscribe(user => {
      if (user) {
        this.user = user;

        this.userEdit = {
          uid: this.user.uid,
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          tel: this.user.tel,
        };

        this.user.photoURL = `https://ui-avatars.com/api/?size=200&background=4F5457&color=EFEFEF&name=${user.firstname}+${user.lastname}`;
      }
    });

    this.records = this.recordService.getRecordsByUser();
  }

  get isMobile() {
    return this.platform.is('hybrid');
  }

  onSubmit() {
    if ((
      (this.userEdit.firstname && !this.userEdit.lastname) || (!this.userEdit.firstname && this.userEdit.lastname) ||
      (!this.userEdit.firstname && !this.userEdit.lastname! && !this.user.displayName)) || !this.userEdit.tel) {
      return;
    }
    let partialuser: Partial<User> = {
      uid: this.userEdit.uid,
      firstname: this.userEdit.firstname ? this.userEdit.firstname : null,
      lastname: this.userEdit.lastname ? this.userEdit.lastname : null,
      tel: this.userEdit.tel,
    }
    this.userService.updateUser(partialuser);

    this.update = false;
  }

  async logOut() {
    let loading = await this.loadingController.create();
    await loading.present();

    await this.authService.SignOut();

    await this.delay(1000);
    await loading.dismiss();
  }

  async addRecord() {
    let modalConfig = {
      component: RecordFormComponent,
      swipeToClose: true,
      cssClass: 'my-modal',
    }
    const modal = await this.modalController.create(modalConfig);
    await modal.present();
  }

  async deleteRecord(record: Record) {
    let loading = await this.loadingController.create();

    await loading.present();

    try {
      await this.recordService.deleteRecord(record.uid);
      if (record.url) {
        await this.storageService.deleteRecord(record.url);;
      }
      this.presentAlert('¡Exito!', 'Registro médico eliminado');
    } catch (err) {
      this.presentAlert('Error', `Hubo un problema.\n Descripcion: ${err}`);
    } finally {
      loading.dismiss();
    }

  }

  updateUrl() {
    this.user.photoURL = 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png';
  }

  downloadFile = async (url: string) => {
    let loading = await this.loadingController.create();
    await loading.present();

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
    } finally {
      loading.dismiss();
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

  trackBy(index: number, record: Record) {
    return record.uid;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
