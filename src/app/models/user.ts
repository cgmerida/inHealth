export class User {
  uid: string;
  firstname: string;
  lastname: string;
  dpi: string;
  pn: string;
  email: string;
  emailVerified: boolean;
  tel?: number;
  medical_records?: [string];
  isAdmin?: boolean;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}


// export class User implements IUser {

//   uid: string;
//   firstname?: string;
//   lastname?: string;
//   email: string;
//   tel?: number;
//   displayName?: string;
//   photoURL?: string;
//   createdAt: Date;
//   updatedAt: Date;

//   constructor(uid, firstname, lastname, email, tel, displayname, photourl, createdAt) {
//     this.uid = uid
//     this.createdAt = (createdAt != null ? createdAt: new Date());

//     this.updatedAt =new Date();
//   }
// }