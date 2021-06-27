import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { Observable } from 'rxjs';
import { Record } from 'src/app/models/app/record';
import { ModalController, Platform } from '@ionic/angular';
import { RecordFormComponent } from '../record-form/record-form.component';
import { RecordService } from 'src/app/services/app/record.service';

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
    private recordsService: RecordService,
    private modalController: ModalController,
    private platform: Platform
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

    this.records = this.recordsService.getRecordsByUser();
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
    await this.authService.SignOut();
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

  updateUrl() {
    this.user.photoURL = 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png';
  }


  get isMobile() {
    return (this.platform.is('android') || this.platform.is('hybrid')) === true
  }

  trackBy(index: number, record: Record) {
    return record.uid;
  }

}
