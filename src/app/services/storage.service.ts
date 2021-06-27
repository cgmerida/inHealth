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
    this.uid = this.authService.currentUserId;
  }

  uploadRecord(path, name, img) {
    return this.storage.upload(`${path}/${this.uid}/${name}`, img)
      .then(task => task.ref.getDownloadURL());
  }

  download(path) {
    return this.storage.ref(path).getDownloadURL()
  }

  deleteRecord(downloadUrl): Promise<void> {
    return this.storage.storage.refFromURL(downloadUrl).delete();
  }
}
