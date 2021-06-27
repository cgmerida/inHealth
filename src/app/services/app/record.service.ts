import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Record } from 'src/app/models/app/record';
import { User } from 'src/app/models/user';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  private recordCollection: AngularFirestoreCollection<Record>;

  constructor(
    private db: AngularFirestore,
    private authService: AuthService) {
    this.recordCollection = this.db.collection<Record>('records');
  }

  getRecords() {
    return this.recordCollection.valueChanges({ idField: 'uid' });
  }

  getRecordsByUser(): Observable<Record[]> {
    let userUid: User["uid"] = this.authService.currentUserId;
    return this.db.collection<Record>('records', ref => {
      return ref.where('owner', '==', userUid);
    })
      .valueChanges({ idField: 'uid' });
  }

  addRecord(record: Record) {
    record.createdAt = new Date();
    record.owner = this.authService.currentUserId;
    return this.recordCollection.add(record)
      .then(() => {
        return `Registo creado exitosamente`;
      })
      .catch(err => {
        return `Error: ${err}`;
      });
  }

  deleteRecord(uid: Record['uid']) {
    return this.recordCollection.doc(uid).delete();
  }
}
