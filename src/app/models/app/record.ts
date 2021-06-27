import { User } from '../user';

export class Record {
  uid?: string;
  name: string;
  url: string;
  owner: User["uid"] | User;
  createdAt: Date;
}