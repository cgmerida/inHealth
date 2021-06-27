import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userCollection: AngularFirestoreCollection<User>;

  constructor(
    private db: AngularFirestore,
    private authService: AuthService
  ) {
    this.userCollection = this.db.collection<User>('users');
  }

  addUser(user: User): Promise<void> {
    return this.userCollection.doc(user.uid)
      .set(user);
  }

  getUsers() {
    return this.userCollection.valueChanges();
  }


  getUser(uid: User["uid"]) {
    return this.userCollection.doc<User>(uid).valueChanges();
  }

  getAuthUser(): Observable<User | null> {
    let uid = this.authService.currentUserId;
    if (!uid)
      return of(null);
    return this.userCollection.doc<User>(uid).valueChanges();
  }

  updateUser(user) {
    return this.userCollection.doc<User>(user.uid).update(user);
  }

  delUser(user) {
    return this.userCollection.doc<User>(user.uid).delete();
  }
}
