import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  private userSub: Subscription;
  user: User;
  userEdit: Partial<User>;
  update: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
    this.userSub = this.userService.getAuthUser().subscribe(user => {
      if (user) {
        this.user = user;

        this.userEdit = {
          uid: this.user.uid,
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          tel: this.user.tel,
        };

        this.user.photoURL = this.user.photoURL ? this.user.photoURL :
          `https://ui-avatars.com/api/?size=200&background=079db6&color=fff&name=${user.firstname}+${user.lastname}`;
      }
    });
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
    this.userSub.unsubscribe();
    await this.authService.SignOut();
  }

  updateUrl() {
    this.user.photoURL = 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png';
  }

}
