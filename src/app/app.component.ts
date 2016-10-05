import { Component, ViewContainerRef } from '@angular/core';

import {
  TaxonomyApi,
  CollectionApi
} from './shared';

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
    viewContainerRef: ViewContainerRef
  ) {
    this.viewContainerRef = viewContainerRef;
  }
}
