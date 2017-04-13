import { ModuleWithProviders, NgModule } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from 'angular2-moment/date-format.pipe';
import {
  AlertModule,
  BsDropdownModule,
  ModalModule,
  PaginationModule,
  PopoverModule,
  TooltipModule
} from 'ngx-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
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
import { AreaService } from './service/area.service';
import { AreaNamePipe } from './pipe/area-name.pipe';
import { AreaApi } from './api/AreaApi';
import { SourceService } from './service/source.service';
import { SourceApi } from './api/SourceApi';
import { MetadataService } from './service/metadata.service';
import { ImageModalOverlayComponent } from './image-gallery/image-modal-overlay.component';
import { NamedPlaceApi } from './api/NamedPlaceApi';
import { FormApi } from './api/FormApi';
import { DocumentApi } from './api/DocumentApi';
import { LajiFormComponent } from './form/laji-form.component';
import { OnlyLoggedIn } from './route/only-logged-in';
import { LajiExternalService } from './service/laji-external.service';
import { MomentModule } from 'angular2-moment';
import { DocumentFormComponent } from './document-form/document-form.component';
import { FormService } from './service/form.service';
import { FormNamePipe } from './pipe/form-name.pipe';
import { CoordinateService } from './service/coordinate.service';
import { TaxonomyApi } from './api/TaxonomyApi';


@NgModule({
  entryComponents: [ImageModalOverlayComponent],
  declarations: [
    NewsListComponent, DocumentFormComponent,
    SpinnerComponent, NotFoundComponent, ToQNamePipe, ToFullUriPipe, ValuesPipe,
    UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, MultiLangPipe, FormattedNumber,
    AreaNamePipe, CollectionNamePipe, FormNamePipe,
    ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, OnlyLoggedComponent, ImageModalComponent, ImageModalOverlayComponent,
    AuthoritiesDirective, ImageComponent, LajiFormComponent
  ],
  imports: [
    ToastModule,
    FormsModule,
    CommonModule,
    HttpModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    MomentModule,
    TooltipModule, PaginationModule, BsDropdownModule, AlertModule, ModalModule, Ng2Webstorage, PopoverModule
  ],
  providers: [ ], // keep this empty!
  exports: [
    CommonModule, HttpModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule,
    AreaNamePipe, NewsListComponent, SpinnerComponent, UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, MultiLangPipe,
    ToQNamePipe, ValuesPipe, CollectionNamePipe, FormNamePipe, LajiFormComponent, DocumentFormComponent,
    ToFullUriPipe, TooltipModule, PaginationModule, BsDropdownModule, AlertModule, ModalModule, PopoverModule,
    FormattedNumber, ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, OnlyLoggedComponent, ImageModalComponent,
    AuthoritiesDirective, MomentModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        LajiExternalService,
        UserService,
        NewsApi,
        FormService,
        FormApi,
        DocumentApi,
        NamedPlaceApi,
        NewsService,
        MapService,
        CollectionService,
        WindowRef,
        CoordinateService,
        ToastsService, AppConfig,
        PersonTokenApi, PersonApi, SearchQuery, WarehouseApi,
        TaxonomyApi,
        AreaApi, AreaService,
        SourceApi, SourceService,
        FeedbackApi, LoggerApi,
        MetadataService,
        WarehouseValueMappingService, TriplestoreLabelService, MetadataApi,
        AutocompleteApi, FooterService, Ng2Webstorage,
        DateFormatPipe,
        ToQNamePipe,
        OnlyLoggedIn,
        {provide: Http, useClass: AuthenticatedHttpService}
      ]
    };
  }
}
