import { BrowserModule } from '@angular/platform-browser';
import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';

import { NgxWebstorageModule } from 'ngx-webstorage';
import { GenericLabelMakerModule } from 'generic-label-maker';
import { LabelDesignerComponent } from './label-designer/label-designer.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    LabelDesignerComponent
  ],
  imports: [
    BrowserModule,
    NgxWebstorageModule.forRoot({prefix: 'LME-', separator: ''}),
    GenericLabelMakerModule
  ],
  providers: [],
  entryComponents: [LabelDesignerComponent]
})
export class AppModule implements DoBootstrap {

  constructor(private injector: Injector) {}

  ngDoBootstrap(appRef: ApplicationRef): void {
    const LabelDesignerElement = createCustomElement(LabelDesignerComponent, {injector: this.injector});
    customElements.define('label-designer', LabelDesignerElement);
  }

}
