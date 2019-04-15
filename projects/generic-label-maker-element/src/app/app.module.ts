import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { GenericLabelMakerModule } from 'generic-label-maker';
import { LabelDesignerComponent } from './label-designer/label-designer.component';

@NgModule({
  declarations: [
    AppComponent,
    LabelDesignerComponent
  ],
  imports: [
    BrowserModule,
    NgxWebstorageModule.forRoot({prefix: 'LME-', separator: ''}),
    GenericLabelMakerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [LabelDesignerComponent]
})
export class AppModule {
}
