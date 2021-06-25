import { Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Product } from 'src/app/models/app/product';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage {

  products: Observable<Product[]>;
  productsForm: FormGroup;
  isSubmitted = false;


  constructor(
    private productService: ProductService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
  ) {

    this.productsForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      unit: [null, Validators.required],
      price: [null, Validators.required],
    });

    this.products = this.productService.getProducts();
  }


  get errorControl() {
    return this.productsForm.controls;
  }

  crearProducto() {
    if (!this.productsForm.valid) {
      return false;
    }

    this.loadingController.create()
      .then(loading => {
        loading.present();
        this.productService.addProduct({ ...this.productsForm.value })
          .then((res) => {
            this.productsForm.reset();
            this.presentAlert(`¡Genial!`, res);
          })
          .catch((error) => {
            this.presentAlert(`Error`, `Problema registrando el vehículo. Error: ${error}`);
            console.log(error);
          })
          .finally(() => {
            loading.dismiss();
          });
      });
  }

  actualizarProducto(form: FormGroup, product) {
    delete product.msg;
    if (!(Object.values(form.value).find(value => value !== '')) || form.invalid) {
      product.msg = form.invalid ? `El precio no es válido.` : `Debe llenar al menos un campo.`;
      return;
    }
    this.loadingController.create()
      .then(loading => {
        loading.present();
        this.productService.updateProduct({
          uid: product.uid,
          name: (form.value.name ? form.value.name : product.name),
          description: (form.value.description ? form.value.description : product.description),
          unit: (form.value.unit ? form.value.unit : product.unit),
          price: (form.value.price ? form.value.price : product.price),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        })
          .then(() => {
            form.reset();
            this.presentAlert(`¡Genial!`, `Información Actualizada.`);
          })
          .catch((error) => {
            this.presentAlert(`Error`, `Problema registrando el vehículo. Error: ${error}`);
            console.log(error);
          })
          .finally(() => {
            loading.dismiss();
          });
      });
  }

  eliminar(uid) {
    this.loadingController.create()
      .then(loading => {
        loading.present();
        this.productService.deleteProduct(uid)
          .then(() => {
            this.presentAlert('¡Bien!', 'Carro Eliminado');
          })
          .catch((err) => {
            this.presentAlert('Error', `Hubo un problema.\n Descripcion: ${err}`);
          })
          .finally(() => {
            loading.dismiss();
          });
      });
  }

  trackBy(index: number, product: Product) {
    return product.uid;
  }

  async presentAlert(hdr, msg) {
    const alert = await this.alertController.create({
      header: hdr,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }
}
