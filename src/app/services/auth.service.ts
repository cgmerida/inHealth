import { Injectable, NgZone } from '@angular/core';
import { Router } from "@angular/router";

import { AngularFireAuth } from "@angular/fire/auth";
import { User as fireUser } from 'firebase/app';
import { AlertController, NavController } from '@ionic/angular';
import { ErrorService } from './error.service';
import { Subscription } from 'rxjs';
import { User } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSub: Subscription;
  private authUser: fireUser;

  constructor(
    private fireAuth: AngularFireAuth,
    private userService: UserService,
    private router: Router,
    private ngZone: NgZone,
    private alertCtl: AlertController,
    private errors: ErrorService,
    private navController: NavController

  ) {
    this.userSub = this.fireAuth.authState.subscribe(fireUser => {
      if (fireUser)
        this.authUser = fireUser;
    })
  }

  getAuthUserUid(): Promise<string | null> {
    return new Promise(resolve => {
      if (this.authUser) {
        resolve(this.authUser.uid)
      } else {
        this.fireAuth.currentUser
          .then(fireUser => {
            if (fireUser)
              resolve(fireUser.uid);
          })
      }
    })

  }

  getAuthUser() {
    return this.fireAuth.currentUser;
  }

  // Register user with email/password
  async RegisterUser(userData) {
    let authUser: fireUser = await this.fireAuth.createUserWithEmailAndPassword(userData.email, userData.password);

    delete userData.password;
    delete userData.confirmpassword;

    let user: User = {
      uid: authUser.uid,
      emailVerified: authUser.emailVerified,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.userService.addUser(user);
    await this.SendVerificationMail();

  }


  // Email verification when new user register
  SendVerificationMail() {
    return this.fireAuth.currentUser
      .then(user => {
        return user.sendEmailVerification();
      })
      .catch((err) => {
        this.presentAlert('Error', 'Problema enviando correo', err);
      });
  }

  // Recover password
  async PasswordRecover(email) {
    try {
      await this.fireAuth.sendPasswordResetEmail(email);
      this.presentAlert('¡Bien!', null, 'El correo para reiniciar tu contraseña ya fue enviado, revisa tu correo');
    } catch (err) {
      this.presentAlert('Error', 'Problema enviando correo', err);
    }
  }

  // Login in with email/password
  LogIn(email: string, password: string) {
    return this.fireAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        result.user.reload();
        this.ngZone.run(async () => {
          this.redirectAuth();
        });
      }).catch((err) => {
        this.presentAlert('Error', 'Problema iniciando sesión',
          this.errors.printErrorByCode(err));
      })
  }


  // Sign-out 
  async SignOut() {
    this.userSub.unsubscribe();
    await this.fireAuth.signOut();

    this.navController.setDirection('root');
    this.router.navigate(['login']);
  }

  private async presentAlert(hdr, shdr, msg) {
    const alert = await this.alertCtl.create({
      // cssClass: 'my-custom-class',
      header: hdr,
      subHeader: shdr,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  redirectAuth() {
    this.navController.setDirection('root');
    this.router.navigate(['/app/inicio']);
  }

}
