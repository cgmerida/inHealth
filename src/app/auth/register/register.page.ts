import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { ErrorService } from 'src/app/services/error.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

  registerForm: FormGroup;
  isSubmitted = false;
  confirm = true;

  constructor(
    public authService: AuthService,
    public router: Router,
    private formBuilder: FormBuilder,
    public alertController: AlertController,
    private errors: ErrorService,
    private loadingController: LoadingController
  ) {

    this.registerForm = this.formBuilder.group({
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      docType: ['dpi', Validators.required],
      dpi: [null, [Validators.required, Validators.pattern('^[0-9]{4}\\s?[0-9]{5}\\s?[0-9]{4}$')]],
      pn: [null, Validators.pattern('^[0-9]{13}$')],
      padre: [null],
      madre: [null],
      tutor: [null],
      email: [null, [Validators.required, Validators.email]],
      tel: [null, [Validators.pattern('^[0-9]{8}$')]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmpassword: [null, [Validators.required, Validators.minLength(8)]]
    });
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

    this.register();
  }

  async register() {
    let loading = await this.loadingController.create();
    await loading.present();

    let user = this.registerForm.value;

    if (user.dpi) {
      user.dpi = user.dpi.replace(/\s/gm, '');
    }
    user = this.clean(user);

    try {
      await this.authService.RegisterUser(user);
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

  toggle() {
    if (this.registerForm.get('docType').value === 'dpi') {
      this.registerForm.get('dpi').setValidators([Validators.required, Validators.pattern('^[0-9]{4}\\s?[0-9]{5}\\s?[0-9]{4}$')]);
      this.registerForm.get('pn').setValidators(null);
    } else {
      this.registerForm.get('pn').setValidators([Validators.required, Validators.pattern('^[0-9]{13}$')]);
      this.registerForm.get('dpi').setValidators(null);
    }
    this.registerForm.get("dpi").updateValueAndValidity();
    this.registerForm.get("pn").updateValueAndValidity();
  }

  clean(obj) {
    for (let propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj
  }

}