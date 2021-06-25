import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Questions } from '../models/app/question';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(private db: AngularFirestore) { }

  getQuestions() {
    return this.db.doc<Questions>("/questions/FdbezA1pUUesppbTYRyP").valueChanges()
      .pipe(map(questionsDB => {
        return questionsDB.questions;
      }));
  }

}
