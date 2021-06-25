import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { UserService } from '../services/user.service';
import { map, flatMap, switchMap, combineLatest, take } from 'rxjs/operators';
import { User } from '../models/user';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AdminRedirectGuard implements CanActivate, CanActivateChild {

    constructor(
        private router: Router,
        private userService: UserService,
        private db: AngularFirestore,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        return this.userService.getAuthUser()
            .pipe(
                map((user: User) => {
                    if (user.isAdmin) {
                        this.router.navigate(["/admin"]);
                        // this.router.navigateByUrl("/admin");
                        return false;
                    }
                    return true;
                })
            );

        // return this.userService.getAuthUser()
        //     .pipe(
        //         take(1),
        //         switchMap(fireUser => {
        //             let userObs = this.db.collection('users').doc<User>("THaNoHDPF1Yp0FG0SPB7MBQwxJk1").valueChanges()
        //             // this.db.doc<User>(`users/${fireUser.uid}`).valueChanges();
        //             return userObs.pipe(
        //                 map((user: User) => {
        //                     console.log(user);
        //                     if (user.isAdmin) {
        //                         this.router.navigate(["/admin"], { skipLocationChange: true });
        //                         return false;
        //                     }
        //                     return true;
        //                 })
        //             );
        //         })
        //     )

    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }

}