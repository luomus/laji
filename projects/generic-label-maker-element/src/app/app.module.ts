import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { GenericLabelMakerModule } from '../../../generic-label-maker/src/lib/generic-label-maker.module';
import { LabelMakerComponent } from './label-maker/label-maker.component';

@NgModule({
  declarations: [
    AppComponent,
    LabelMakerComponent
  ],
  imports: [
    BrowserModule,
    NgxWebstorageModule.forRoot({prefix: 'LME-', separator: ''}),
    GenericLabelMakerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
