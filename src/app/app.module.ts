import { NgModule, ErrorHandler } from '@angular/core';
import { LocationStrategy, PathLocationStrategy, DatePipe } from '@angular/common';
import { routing, appRoutingProviders } from './app.routes';
import { AppComponent } from './app.component';
import { NavbarComponent, FooterComponent } from './shared';
import { LangSelectComponent } from './shared/navbar/lang-select.component';
import { PersonTokenApi } from './shared/api/PersonTokenApi';
import { PersonApi } from './shared/api/PersonApi';
import { WarehouseApi } from './shared/api/WarehouseApi';
import { WarehouseValueMappingService } from './shared/service/warehouse-value-mapping.service';
import { TriplestoreLabelService } from './shared/service/triplestore-label.service';
import { MetadataApi } from './shared/api/MetadataApi';
import { AutocompleteApi } from './shared/api/AutocompleteApi';
import { FooterService } from './shared/service/footer.service';
import { LocalStorageService } from 'angular2-localstorage/dist';
import { SharedModule } from './shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from 'ng2-translate';
import { CoreModule } from './shared/core.module';
import { LajiErrorHandler } from './shared/error/laji-error-handler';
import { SearchQuery } from './+observation/search-query.model';
import { ToastsService } from './shared/service/toasts.service';
import { ToastModule } from 'ng2-toastr';

@NgModule({
  declarations: [
    AppComponent, NavbarComponent, FooterComponent, LangSelectComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    ToastModule,
    TranslateModule.forRoot(),
    CoreModule.forRoot(),
    routing
  ],
  providers: [
    {provide: 'Window', useValue: window},
    {provide: ErrorHandler, useClass: LajiErrorHandler},
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    ToastsService,
    PersonTokenApi, PersonApi, SearchQuery, WarehouseApi,
    WarehouseValueMappingService, TriplestoreLabelService, MetadataApi,
    appRoutingProviders, AutocompleteApi, FooterService, LocalStorageService,
    DatePipe
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
