import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { TooltipModule, PaginationModule, DropdownModule, AlertModule, ModalModule } from 'ng2-bootstrap';
import { TranslateModule, TranslateService } from 'ng2-translate';
import { NewsListComponent } from './news-list/news-list.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { UsersPipe } from './pipe/users.pipe';
import { LabelPipe } from './pipe/label.pipe';
import { FormattedNumber } from './pipe/formated-number.pipe';
import { ObservationCountComponent } from '../+observation/count/observation-count.component';
import { ObservationMapComponent } from '../+observation/map/observation-map.component';
import { MapComponent } from './map/map.component';
import { PanelComponent } from './panel/panel.component';
import { OmniSearchComponent } from './omni-search/omni-search.component';
import { SafePipe } from './pipe/safe.pipe';
import { MultiLangPipe } from './pipe/multi-lang.pipe';
import { NewsService } from './service/news.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { OnlyLoggedComponent } from './only-logged/only-logged.component';
import { ImageModalComponent } from './image-gallery/image-modal.component';
import { MapService } from './map/map.service';
import { ToQNamePipe } from './pipe/to-qname.pipe';
import { WindowRef } from './windows-ref';
import { ToFullUriPipe } from './pipe/to-full-uri';
import { GalleryComponent } from '../+observation/gallery/gallery.component';
import { AuthoritiesDirective } from './authorities/authorities.directive';
import { UserService } from './service/user.service';
import { NewsApi } from './api/NewsApi';
import { ToastModule } from 'ng2-toastr';
import { ToastsService } from './service/toasts.service';
import { AppConfig } from '../app.config';
import { PersonTokenApi } from './api/PersonTokenApi';
import { PersonApi } from './api/PersonApi';
import { SearchQuery } from '../+observation/search-query.model';
import { WarehouseApi } from './api/WarehouseApi';
import { FeedbackApi } from './api/FeedbackApi';
import { LoggerApi } from './api/LoggerApi';
import { WarehouseValueMappingService } from './service/warehouse-value-mapping.service';
import { TriplestoreLabelService } from './service/triplestore-label.service';
import { MetadataApi } from './api/MetadataApi';
import { Ng2Webstorage } from 'ng2-webstorage';
import { FooterService } from './service/footer.service';
import { AutocompleteApi } from './api/AutocompleteApi';
import { AuthenticatedHttpService } from './service/authenticated-http.service';
import { ImageComponent } from './image/image.component';
import { ValuesPipe } from './pipe/values.pipe';
import { CollectionService } from './service/collection.service';
import { CollectionNamePipe } from './pipe/collection-name.pipe';


@NgModule({
  declarations: [
    NewsListComponent,
    SpinnerComponent, NotFoundComponent, ToQNamePipe, ToFullUriPipe, ValuesPipe,
    UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, MultiLangPipe, FormattedNumber,
    ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, OnlyLoggedComponent, ImageModalComponent,
    AuthoritiesDirective, ImageComponent
  ],
  imports: [
    ToastModule,
    FormsModule,
    CommonModule,
    HttpModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    TooltipModule, PaginationModule, DropdownModule, AlertModule, ModalModule, Ng2Webstorage
  ],
  providers: [ ], // keep this empty!
  exports: [
    CommonModule, HttpModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule,
    NewsListComponent, SpinnerComponent, UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, MultiLangPipe, ToQNamePipe, ValuesPipe,
    ToFullUriPipe, TooltipModule, PaginationModule, DropdownModule, AlertModule, ModalModule,
    FormattedNumber, ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, OnlyLoggedComponent, ImageModalComponent,
    AuthoritiesDirective
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        UserService,
        NewsApi,
        NewsService,
        MapService,
        CollectionService,
        WindowRef,
        ToastsService, AppConfig,
        PersonTokenApi, PersonApi, SearchQuery, WarehouseApi, FeedbackApi, LoggerApi,
        WarehouseValueMappingService, TriplestoreLabelService, MetadataApi,
        AutocompleteApi, FooterService, Ng2Webstorage,
        DatePipe,
        {provide: Http, useClass: AuthenticatedHttpService}
      ]
    };
  }
}
