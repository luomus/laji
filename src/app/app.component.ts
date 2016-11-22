import { Component, ViewContainerRef } from '@angular/core';
import { TaxonomyApi, CollectionApi } from './shared';
import { ToastsManager } from 'ng2-toastr';

@Component({
  selector: 'laji-app',
  providers: [
    TaxonomyApi,
    CollectionApi
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public viewContainerRef: ViewContainerRef;

  constructor(public toastr: ToastsManager, viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
    this.toastr.setRootViewContainerRef(viewContainerRef);
  }
}
