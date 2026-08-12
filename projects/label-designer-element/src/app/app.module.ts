import { BrowserModule } from '@angular/platform-browser';
import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';

import { provideNgxWebstorage, withNgxWebstorageConfig, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { LabelDesignerModule } from '@luomus/label-designer';
import { LabelDesignerComponent } from './label-designer/label-designer.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
    declarations: [
        LabelDesignerComponent
    ],
    imports: [
        BrowserModule,
        LabelDesignerModule
    ],
    providers: [
      provideNgxWebstorage(
    		withNgxWebstorageConfig({ prefix: 'LME-', separator: '' }),
    		withLocalStorage(),
    		withSessionStorage()
      ),
    ]
})
export class AppModule implements DoBootstrap {

  constructor(private injector: Injector) {}

  ngDoBootstrap(appRef: ApplicationRef): void {
    const labelDesignerElement = createCustomElement(LabelDesignerComponent, {injector: this.injector});
    customElements.define('label-designer', labelDesignerElement);
  }

}
