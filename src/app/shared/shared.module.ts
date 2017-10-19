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
import { UsersPipe } from './pipe/users.pipe';
import { LabelPipe } from './pipe/label.pipe';
import { FormattedNumber } from './pipe/formated-number.pipe';
import { ObservationCountComponent } from '../+observation/count/observation-count.component';
import { ObservationMapComponent } from '../+observation/map/observation-map.component';
import { MapComponent } from './map/map.component';
import { PanelComponent } from './panel/panel.component';
import { OmniSearchComponent } from './omni-search/omni-search.component';
import { SafePipe } from './pipe/safe.pipe';
import { NewsService } from './service/news.service';
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
import { NlToBrPipe } from './pipe/nl-to-br.pipe';
import { DocumentFormHeaderComponent } from './document-form-header/document-form-header.component';
import { DialogService } from './service/dialog.service';
import { DocumentDeActivateGuard } from './document-form/document-de-activate.guard';
import { ScriptService } from './service/script.service';
import { LocalizePipe } from '../locale/localize.pipe';
import { CacheService } from './service/cache.service';
import { NotificationComponent } from './navbar/notification/notification.component';
import { HideScrollDirective } from './directive/hide-scroll';
import { LoggedInDirective } from './directive/logged-in.directive';
import { FixedBelowDirective } from './directive/fixed-below.directive';
import { LangModule } from '../shared-modules/lang/lang.module';
import { SpinnerModule } from '../shared-modules/spinner/spinner.module';
import { ClickOutSideDirective } from './directive/click-out-side.directive';


@NgModule({
  entryComponents: [ImageModalOverlayComponent],
  declarations: [
    NewsListComponent, DocumentFormComponent, LocalizePipe, NotificationComponent,
    ToQNamePipe, ToFullUriPipe, ValuesPipe,
    UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, FormattedNumber,
    AreaNamePipe, CollectionNamePipe, FormNamePipe,
    ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, ImageModalComponent, ImageModalOverlayComponent,
    AuthoritiesDirective, ImageComponent, LajiFormComponent, NlToBrPipe, DocumentFormHeaderComponent,
    NotificationComponent, HideScrollDirective, LoggedInDirective, FixedBelowDirective, ClickOutSideDirective
  ],
  imports: [
    ToastModule,
    FormsModule,
    CommonModule,
    HttpModule,
    RouterModule,
    LangModule,
    TranslateModule,
    ReactiveFormsModule,
    MomentModule,
    SpinnerModule,
    TooltipModule, PaginationModule, BsDropdownModule, AlertModule, ModalModule, Ng2Webstorage, PopoverModule
  ],
  providers: [ ], // keep this empty!
  exports: [
    CommonModule, HttpModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule, NotificationComponent,
    AreaNamePipe, NewsListComponent, UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, SpinnerModule,
    ToQNamePipe, ValuesPipe, CollectionNamePipe, FormNamePipe, LajiFormComponent, DocumentFormComponent,
    ToFullUriPipe, TooltipModule, PaginationModule, BsDropdownModule, AlertModule, ModalModule, PopoverModule,
    FormattedNumber, ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, ImageModalComponent, NlToBrPipe,
    AuthoritiesDirective, MomentModule, DocumentFormHeaderComponent, LocalizePipe, HideScrollDirective,
    LoggedInDirective, FixedBelowDirective, ClickOutSideDirective
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
        CacheService,
        FormApi,
        DocumentApi,
        NamedPlaceApi,
        NewsService,
        MapService,
        CollectionService,
        WindowRef,
        CoordinateService,
        ToastsService,
        PersonTokenApi, PersonApi, SearchQuery, WarehouseApi,
        TaxonomyApi,
        AreaApi, AreaService,
        SourceApi, SourceService,
        FeedbackApi, LoggerApi,
        MetadataService,
        WarehouseValueMappingService, TriplestoreLabelService, MetadataApi,
        AutocompleteApi, FooterService, Ng2Webstorage,
        DateFormatPipe,
        FormattedNumber,
        ToQNamePipe,
        OnlyLoggedIn,
        DialogService,
        ScriptService,
        DocumentDeActivateGuard,
        {provide: Http, useClass: AuthenticatedHttpService}
      ]
    };
  }
}
