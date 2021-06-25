import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Responses } from '../models/app/responses';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {

  private responsesCollection: AngularFirestoreCollection<Responses>

  constructor(private db: AngularFirestore, private authService: AuthService) {
    this.responsesCollection = this.db.collection<Responses>('responses');
  }


  async addResponse(res) {
    let response: Responses = {
      ...res,
      owner: await this.authService.getAuthUserUid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return this.responsesCollection.add({ ...response })
      .then(() => {
        let rating = 0;
        let counter = 0;
        res.responses.forEach(response => {
          rating += response.rating;
          counter++;
        });
        return this.db.doc(`orders/${res.orderUid}`).update({ rating: 5 * (rating / (5 * counter)) });
      })
      .then(() => {
        return `Respuestas registradas`;
      });
  }

  getResponses() {
    return this.responsesCollection.valueChanges();
  }
}
