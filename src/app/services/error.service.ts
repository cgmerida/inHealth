import { Injectable } from '@angular/core';
import { MessagesIndex } from '../models/errors';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  private params = {
    'auth/invalid-argument': 'Se proporcionó un argumento no válido para un método de autenticación.',
    'auth/invalid-email-verified': 'El valor que se proporcionó para la propiedad del usuario emailVerified no es válido.',
    'auth/invalid-email': 'El correo que se proporcionó no tiene un formato válido.',
    'auth/invalid-password': 'Se proporcionó un argumento no válido para un método de autenticación.',
    'auth/invalid-photo-url': 'El valor que se proporcionó para la propiedad del usuario photoURL no es válido.',
    'auth/uid-already-exists': 'Otro usuario ya utiliza el uid proporcionado.',
    'auth/email-already-exists': 'Otro usuario ya está utilizando el correo electrónico proporcionado.',
    'auth/user-not-found': 'No existe ningún registro de usuario que corresponda a las credenciales. Verifique que este registrado.',
    'auth/operation-not-allowed': 'El metodo de autenticación proporcionado está inhabilitado.',
    'auth/auth/invalid-credential': 'La credencial que se usa en la autenticación de los SDK de Admin no se puede emplear para realizar la acción deseada.',
    'auth/phone-number-already-exists': 'Otro usuario ya utiliza el número de telefono proporcionado.',
    'auth/wrong-password': 'La contraseña no es correcta.',
    'auth/user-disabled': 'La cuenta ha sido deshabilitada por el administrador.',
    'auth/email-already-in-use': 'El correo ya esta en uso en otra cuenta.',
    'auth/network-request-failed': 'No se pudo establecer conexión a internet.',
    'auth/too-many-requests': 'Se han hecho demasiados intentos. Espere 1 minuto para volver a intentar',
    'auth/user-cancelled': 'El usuario cancelo la operación.',
    'auth/popup-closed-by-user': 'El usuario cerro la página de autenticación',
    'storage/invalid-argument': 'Archivo no válido.'
  } as MessagesIndex;

  constructor() { }

  printErrorByCode(error): string {

    if (this.params[error.code]) {
      return (this.params[error.code]);
    } else {
      return (error.message);
    }
  }
}
