import { Injectable, NgZone } from '@angular/core';
import { Router } from "@angular/router";

import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from "../models/user";
import { auth, User as fireUser } from 'firebase/app';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { ErrorService } from './error.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSub: Subscription;
  private authUser: fireUser;

  constructor(
    private fireStore: AngularFirestore,
    private fireAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone,
    private alertCtl: AlertController,
    private errors: ErrorService,
    private googlePlus: GooglePlus,
    private platform: Platform,
    private fb: Facebook,
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
  RegisterUser(email: string, password: string) {
    return this.fireAuth.createUserWithEmailAndPassword(email, password)
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

  // Sign in with Gmail
  GoogleAuth() {
    if (this.platform.is('capacitor') && this.platform.is('android')) {
      this.googleAuthAndroid();
    } else {
      return this.AuthLogin(new auth.GoogleAuthProvider());
    }
  }

  // Sign in with Facebook
  FacebookAuth() {
    if (this.platform.is('capacitor') && this.platform.is('android')) {
      this.fbAuthAndroid();
    } else {
      this.AuthLogin(new auth.FacebookAuthProvider());
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
        // this.storeUser(result.user);
      }).catch((err) => {
        this.presentAlert('Error', 'Problema iniciando sesión',
          this.errors.printErrorByCode(err));
      })
  }


  async googleAuthAndroid() {
    let res;
    try {
      res = await this.googlePlus.login({
        'scopes': 'profile email',
        'webClientId': '320328269998-urcbhefqbpsb05q1t644d3m7a6iptlho.apps.googleusercontent.com',
        'offline': true
      });
    } catch (error) {
      this.presentAlert('Error', 'Error conectando con google', error);
      return;
    }

    try {
      const resConfirmed = await this.fireAuth.signInWithCredential(auth.GoogleAuthProvider.credential(res.idToken));
      await this.storeUserProvider(resConfirmed.user);
      this.redirectAuth();
    } catch (err) {
      this.presentAlert('Error', 'Problema iniciando sesión', this.errors.printErrorByCode(err));
    }
  }

  async fbAuthAndroid() {
    let res: FacebookLoginResponse;
    try {
      res = await this.fb.login(['public_profile', 'email']);
    } catch (error) {
      this.presentAlert('Error', 'Error conectando con Facebook', error);
      return;
    }

    try {
      const resConfirmed = await this.fireAuth.signInWithCredential(auth.FacebookAuthProvider.credential(res.authResponse.accessToken));
      await this.storeUserProvider(resConfirmed.user);
      this.redirectAuth();
    } catch (err) {
      this.presentAlert('Error', 'Problema iniciando sesión', this.errors.printErrorByCode(err));
    }
  }



  // Auth providers
  private AuthLogin(provider) {
    return this.fireAuth.signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(async () => {
          await this.storeUserProvider(result.user);
          this.redirectAuth();
        });
      }).catch((err) => {
        this.presentAlert('Error', 'Problema iniciando sesión', this.errors.printErrorByCode(err));
      })
  }

  private storeUserProvider(user: fireUser) {
    user.reload();

    const userRef: AngularFirestoreDocument<User> = this.fireStore.doc<User>(`users/${user.uid}`);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return userRef.set(userData, {
      merge: true
    })
  }

  private storeUser(user) {

    console.log(user);

    const userRef: AngularFirestoreDocument<User> = this.fireStore.doc<User>(`users/${user.uid}`);

    const userData = {
      uid: user.uid,
      emailVerified: user.emailVerified,
      updatedAt: new Date(),
    }
    userRef.update(userData);

    userRef.valueChanges().subscribe(user => {
      console.log(user);
    });
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
