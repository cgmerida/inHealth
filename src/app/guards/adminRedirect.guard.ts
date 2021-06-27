import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AdminRedirectGuard implements CanActivate, CanActivateChild {

    constructor(
        private router: Router,
        private userService: UserService,
    ) { }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        let user = await this.userService.getAuthUser().toPromise();
        console.log(user);
        if (user && user.isAdmin) {
            this.router.navigate(["/admin"]);
            // this.router.navigateByUrl("/admin");
            return false;
        }
        return true;

    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }

}