import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from 'angular2-moment/date-format.pipe';
import {
  AlertModule,
  BsDropdownModule,
  ModalModule,
  PopoverModule, ProgressbarModule,
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
import { ToastsService } from './service/toasts.service';
import { PersonApi } from './api/PersonApi';
import { SearchQuery } from '../+observation/search-query.model';
import { WarehouseApi } from './api/WarehouseApi';
import { LoggerApi } from './api/LoggerApi';
import { WarehouseValueMappingService } from './service/warehouse-value-mapping.service';
import { TriplestoreLabelService } from './service/triplestore-label.service';
import { MetadataApi } from './api/MetadataApi';
import { Ng2Webstorage } from 'ng2-webstorage';
import { FooterService } from './service/footer.service';
import { AuthenticatedHttpInterceptor } from './service/authenticated-http.interceptor';
import { ImageComponent } from './image/image.component';
import { ValuesPipe } from './pipe/values.pipe';
import { CollectionService } from './service/collection.service';
import { CollectionNamePipe } from './pipe/collection-name.pipe';
import { AreaService } from './service/area.service';
import { AreaNamePipe } from './pipe/area-name.pipe';
import { SourceService } from './service/source.service';
import { MetadataService } from './service/metadata.service';
import { ImageModalOverlayComponent } from './image-gallery/image-modal-overlay.component';
import { NamedPlaceApi } from './api/NamedPlaceApi';
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
import { PaginatorModule } from '../shared-modules/paginator/paginator.module';
import { ObservationGroupSelectComponent } from './group-select/group-select.component';
import { SourcePipe } from './pipe/source.pipe';
import { TaxonNamePipe } from './pipe/taxon-name.pipe';
import { DocumentFormFooterComponent } from './document-form-footer/document-form-footer.component';
import { InformalTaxonGroupApi } from './api/InformalTaxonGroupApi';
import { RemoveEmptyPipe } from './pipe/remove-empty.pipe';
import {FriendService} from './service/friend.service';
import { DatePickerComponent } from './datepicker/datepicker.component'
import { TaxonNameComponent } from './taxon-name/taxon-name.component';
import { FactNotInPipe } from './pipe/fact-not-in.pipe';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {LajiApiService} from './service/laji-api.service';
import { PublicationService } from './service/publication.service';


@NgModule({
  entryComponents: [ImageModalOverlayComponent],
  declarations: [
    NewsListComponent, DocumentFormComponent, LocalizePipe, NotificationComponent,
    ToQNamePipe, ToFullUriPipe, ValuesPipe,
    UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, FormattedNumber,
    AreaNamePipe, TaxonNamePipe, CollectionNamePipe, FormNamePipe,
    ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, ImageModalComponent, ImageModalOverlayComponent,
    AuthoritiesDirective, ImageComponent, LajiFormComponent, NlToBrPipe, DocumentFormHeaderComponent,
    NotificationComponent, HideScrollDirective, LoggedInDirective, FixedBelowDirective, ClickOutSideDirective,
    ObservationGroupSelectComponent, SourcePipe, RemoveEmptyPipe, DocumentFormFooterComponent, DatePickerComponent,
    TaxonNameComponent,
    FactNotInPipe,
  ],
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule,
    LangModule,
    TranslateModule,
    ReactiveFormsModule,
    MomentModule,
    SpinnerModule,
    PaginatorModule,
    TooltipModule, BsDropdownModule, AlertModule, ModalModule, Ng2Webstorage, PopoverModule, ProgressbarModule
  ],
  providers: [ ], // keep this empty!
  exports: [
    CommonModule, HttpClientModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule, NotificationComponent,
    AreaNamePipe, TaxonNamePipe, NewsListComponent, UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, SpinnerModule,
    ToQNamePipe, ValuesPipe, CollectionNamePipe, FormNamePipe, LajiFormComponent, DocumentFormComponent,
    ToFullUriPipe, TooltipModule, BsDropdownModule, AlertModule, ModalModule, PopoverModule, ProgressbarModule,
    FormattedNumber, ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, ImageModalComponent, NlToBrPipe, PaginatorModule,
    AuthoritiesDirective, MomentModule, DocumentFormHeaderComponent, LocalizePipe, HideScrollDirective,
    LoggedInDirective, FixedBelowDirective, ClickOutSideDirective, ObservationGroupSelectComponent,
    SourcePipe, RemoveEmptyPipe, DocumentFormFooterComponent, DatePickerComponent, TaxonNameComponent,
    FactNotInPipe
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        InformalTaxonGroupApi,
        LajiExternalService,
        UserService,
        FormService,
        CacheService,
        DocumentApi,
        NamedPlaceApi,
        NewsService,
        MapService,
        CollectionService,
        WindowRef,
        CoordinateService,
        ToastsService,
        PersonApi, SearchQuery, WarehouseApi,
        TaxonomyApi,
        AreaService,
        SourceService,
        LoggerApi,
        MetadataService,
        WarehouseValueMappingService, TriplestoreLabelService, MetadataApi,
        FooterService, Ng2Webstorage,
        DateFormatPipe,
        FormattedNumber,
        ToQNamePipe,
        OnlyLoggedIn,
        DialogService,
        ScriptService,
        DocumentDeActivateGuard,
        FriendService,
        TaxonNamePipe,
        ToQNamePipe,
        LajiApiService,
        PublicationService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthenticatedHttpInterceptor,
          multi: true
        }
      ]
    };
  }
}
