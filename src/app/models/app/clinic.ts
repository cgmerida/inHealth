
export class Clinic {
  uid: string;
  name: string;
  dir: string;
  schedule: number;
  tel: number;
  specialties: Specialty[]
  location: any;
  createdAt?: Date;
  updatedAt?: Date;
}

class Specialty {
  name: string;
  doc: string;
}