import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable()
export class LajiErrorHandler implements ErrorHandler {

  private router;
  private route;

  constructor(private injector: Injector) {}

  handleError(error) {
    console.log(error);
    console.log(this.getActiveRoute().toString());
  }

  private getRouter(): Router {
    if (!this.router) {
      this.router = this.injector.get(Router);
    }
    return this.router;
  }

  private getActiveRoute(): ActivatedRoute {
    if (!this.route) {
      this.route = this.injector.get(ActivatedRoute);
    }
    return this.route;
  }

}
