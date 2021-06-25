import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { User } from '../../models/user';
import { ErrorService } from 'src/app/services/error.service';


import { Plugins, StatusBarStyle } from '@capacitor/core';

const { StatusBar } = Plugins;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;
  isSubmitted = false;
  confirm = true;

  constructor(
    public authService: AuthService,
    public router: Router,
    private formBuilder: FormBuilder,
    public alertController: AlertController,
    private userService: UserService,
    private errors: ErrorService,
    private loadingController: LoadingController,
    private platform: Platform,
  ) {

    this.registerForm = this.formBuilder.group({
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      tel: [null, [Validators.required, Validators.pattern('[0-9]{8}')]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmpassword: [null, [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() { }

  ionViewDidEnter() {
    if (this.platform.is('hybrid')) {
      StatusBar.setBackgroundColor({ color: '#079db6' });
      StatusBar.setStyle({ style: StatusBarStyle.Dark });
    }
  }

  get errorControl() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.isSubmitted = true;

    this.confirm = this.registerForm.get('password').value === this.registerForm.get('confirmpassword').value;

    if (!this.registerForm.valid || !this.confirm) {
      this.registerForm.get('password').patchValue(null);
      this.registerForm.get('confirmpassword').patchValue(null);
      return false;
    }

    this.register(this.registerForm.get('email').value, this.registerForm.get('password').value);
  }

  async register(email, password) {
    let loading = await this.loadingController.create();
    await loading.present();

    try {
      let authUser = await this.authService.RegisterUser(email, password);
      let temp = this.registerForm.value;

      delete temp.password;
      delete temp.confirmpassword;

      let user: User = {
        uid: authUser.user.uid,
        emailVerified: authUser.user.emailVerified,
        ...temp,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.userService.addUser(user);
      await this.authService.SendVerificationMail();

      await this.router.navigate(['verify-email']);

    } catch (err) {
      await this.presentAlert(this.errors.printErrorByCode(err.code));
    } finally {
      await loading.dismiss();
    }

  }


  async presentAlert(msg) {
    const alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: 'Error',
      subHeader: 'Problema registrando usuario.',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

}
