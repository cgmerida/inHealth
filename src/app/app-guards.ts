import { map } from 'rxjs/operators';
import { User } from 'firebase';

export const redirectLoggedInToInicio = () =>
    map((user: User) => {
        return user ? (user.emailVerified ? ['/app/inicio'] : ['/verify-email']) : true;
    });

export const redirectVerified = () =>
    map((user: User) => {
        return user ? (!user.emailVerified ? true : ['/app/inicio']) : ['/login'];
    });

export const redirectOrVerifyEmail = () =>
    map((user: User) => {
        return user ? (user.emailVerified ? true : ['/verify-email']) : ['/login'];
    });