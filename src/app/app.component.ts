import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr';
import { ComponentsHelper } from 'ng2-bootstrap';
import { TaxonomyApi } from './shared/api/TaxonomyApi';
import { CollectionApi } from './shared/api/CollectionApi';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { InformationApi } from './shared/api/InformationApi';

declare const ga: Function;

@Component({
  selector: 'laji-app',
  providers: [
    TaxonomyApi,
    CollectionApi,
    InformationApi
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public viewContainerRef: ViewContainerRef;
  private currentRoute: string;

  constructor(
    router: Router,
    location: Location,
    componentsHelper: ComponentsHelper,
    toastr: ToastsManager,
    viewContainerRef: ViewContainerRef
  ) {
    this.viewContainerRef = viewContainerRef;
    componentsHelper.setRootViewContainerRef(viewContainerRef);
    toastr.setRootViewContainerRef(viewContainerRef);
    router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        let newRoute = '/' + location.path() || '/';
        if (this.currentRoute !== newRoute && newRoute.indexOf('/user') !== 0) {
          ga('send', 'pageview', newRoute);
          this.currentRoute = newRoute;
        }
      }
    });
  }
}
