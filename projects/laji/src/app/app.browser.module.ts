import { AppComponent } from './shared-modules/app-component/app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TaxonAutocompleteService } from './shared/service/taxon-autocomplete.service';
import { LabelPipe } from './shared/pipe/label.pipe';


@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppModule,
    BrowserAnimationsModule,
    BrowserTransferStateModule
  ],
  providers: [
    TaxonAutocompleteService,
    LabelPipe
  ]
})
export class AppBrowserModule {
}
