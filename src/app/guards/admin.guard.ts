import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { UserService } from '../services/user.service';
import { map, take, flatMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanActivateChild {

    constructor(
        private router: Router,
        private userService: UserService,
        private db: AngularFirestore
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        return this.userService.getAuthUser()
            .pipe(
                map((user: User) => {
                    if (!user.isAdmin) {
                        this.router.navigate(["/app"]);
                        // this.router.navigateByUrl("/app");
                        return false;
                    }

                    return true;
                })
            );
    }


    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }
}