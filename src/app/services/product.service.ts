import { Injectable } from '@angular/core';
import { Product } from '../models/app/product';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productCollection: AngularFirestoreCollection<Product>;

  constructor(private db: AngularFirestore) {

    this.productCollection = this.db.collection<Product>('products');

  }

  getProducts() {
    return this.productCollection.valueChanges({ idField: 'uid' });
  }

  addProduct(product: Product) {
    product.createdAt = new Date();
    product.updatedAt = new Date();
    return this.productCollection.add(product)
      .then(() => {
        return `Nuevo producto creado`;
      })
      .catch(err => {
        return `Error: ${err}`;
      });
  }

  updateProduct(product: Product) {
    product.updatedAt = new Date();
    return this.productCollection.doc(product.uid).update(product);
  }

  deleteProduct(uid: Product['uid']) {
    return this.productCollection.doc(uid).delete();
  }
}
