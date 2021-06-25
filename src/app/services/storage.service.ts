import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private uid: string;

  constructor(private storage: AngularFireStorage,
    private authService: AuthService) {
    this.loadUser();
  }

  private async loadUser() {
    this.uid = await this.authService.getAuthUserUid();
  }

  uploadCarImg(img, name) {
    // let fecha = new Date().toLocaleDateString().replace(/\//g, "-");
    return this.storage.upload(`cars/${this.uid}/${name}.jpg`, img)
      .then(task => task.ref.getDownloadURL());
  }

  deleteCarPhoto(downloadUrl): Promise<void> {
    return this.storage.storage.refFromURL(downloadUrl).delete();
  }
}
