import { map } from 'rxjs/operators';
import { User } from 'firebase';

export const redirectLoggedInToInicio = () =>
    map((user: User) => {
        return user ? (user.emailVerified ? true : ['/verify-email']) : ['/login'];
    });

export const redirectVerified = () =>
    map((user: User) => {
        return user ? (!user.emailVerified ? true : ['admin/inicio']) : ['/login'];
    });

export const redirectOrVerifyEmail = () =>
    map((user: User) => {
        return user ? (user.emailVerified ? true : ['/verify-email']) : ['/login'];
    });