import { Component, ViewContainerRef } from '@angular/core';
import { TaxonomyApi, CollectionApi } from './shared';
import { ToastsManager } from 'ng2-toastr';
import { ComponentsHelper } from 'ng2-bootstrap';

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

  constructor(
    componentsHelper: ComponentsHelper,
    toastr: ToastsManager,
    viewContainerRef: ViewContainerRef
  ) {
    this.viewContainerRef = viewContainerRef;
    componentsHelper.setRootViewContainerRef(viewContainerRef);
    toastr.setRootViewContainerRef(viewContainerRef);
  }
}
