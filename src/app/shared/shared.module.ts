import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from 'angular2-moment/date-format.pipe';
import { AlertModule, BsDropdownModule, ModalModule, PopoverModule, ProgressbarModule, TooltipModule } from 'ngx-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NewsListComponent } from './news-list/news-list.component';
import { UsersPipe } from './pipe/users.pipe';
import { LabelPipe } from './pipe/label.pipe';
import { FormattedNumber } from './pipe/formated-number.pipe';
import { ObservationCountComponent } from '../+observation/count/observation-count.component';
import { PanelComponent } from './panel/panel.component';
import { OmniSearchComponent } from './omni-search/omni-search.component';
import { SafePipe } from './pipe/safe.pipe';
import { ImageModalComponent } from './image-gallery/image-modal.component';
import { ToQNamePipe } from './pipe/to-qname.pipe';
import { ToFullUriPipe } from './pipe/to-full-uri';
import { GalleryComponent } from '../+observation/gallery/gallery.component';
import { AuthoritiesDirective } from './authorities/authorities.directive';
import { Ng2Webstorage } from 'ngx-webstorage';
import { AuthenticatedHttpInterceptor } from './service/authenticated-http.interceptor';
import { ImageComponent } from './image/image.component';
import { ValuesPipe } from './pipe/values.pipe';
import { CollectionNamePipe } from './pipe/collection-name.pipe';
import { AreaNamePipe } from './pipe/area-name.pipe';
import { ImageModalOverlayComponent } from './image-gallery/image-modal-overlay.component';
import { MomentModule } from 'angular2-moment';
import { FormNamePipe } from './pipe/form-name.pipe';
import { NlToBrPipe } from './pipe/nl-to-br.pipe';
import { LocalizePipe } from '../locale/localize.pipe';
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
import { RemoveEmptyPipe } from './pipe/remove-empty.pipe';
import { DatePickerComponent } from './datepicker/datepicker.component'
import { TaxonNameComponent } from './taxon-name/taxon-name.component';
import { FactNotInPipe } from './pipe/fact-not-in.pipe';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServerOnlyDirective } from './directive/server-only.directive';
import { BrowserOnlyDirective } from './directive/browser-only.directive';


@NgModule({
  entryComponents: [ImageModalOverlayComponent],
  declarations: [
    NewsListComponent, LocalizePipe, NotificationComponent,
    ToQNamePipe, ToFullUriPipe, ValuesPipe,
    UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, FormattedNumber,
    AreaNamePipe, TaxonNamePipe, CollectionNamePipe, FormNamePipe,
    ObservationCountComponent, GalleryComponent,
    PanelComponent, OmniSearchComponent, ImageModalComponent, ImageModalOverlayComponent,
    AuthoritiesDirective, ImageComponent, NlToBrPipe,
    NotificationComponent, HideScrollDirective, LoggedInDirective, FixedBelowDirective, ClickOutSideDirective,
    ObservationGroupSelectComponent, SourcePipe, RemoveEmptyPipe, DatePickerComponent, ServerOnlyDirective, BrowserOnlyDirective,
    TaxonNameComponent,
    FactNotInPipe,
  ],
  imports: [
    FormsModule,
    CommonModule,
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
    CommonModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule, NotificationComponent,
    AreaNamePipe, TaxonNamePipe, NewsListComponent, UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, SpinnerModule,
    ToQNamePipe, ValuesPipe, CollectionNamePipe, FormNamePipe,
    ToFullUriPipe, TooltipModule, BsDropdownModule, AlertModule, ModalModule, PopoverModule, ProgressbarModule,
    FormattedNumber, ObservationCountComponent, GalleryComponent,
    PanelComponent, OmniSearchComponent, ImageModalComponent, NlToBrPipe, PaginatorModule,
    AuthoritiesDirective, MomentModule, LocalizePipe, HideScrollDirective, ServerOnlyDirective, BrowserOnlyDirective,
    LoggedInDirective, FixedBelowDirective, ClickOutSideDirective, ObservationGroupSelectComponent,
    SourcePipe, RemoveEmptyPipe, DatePickerComponent, TaxonNameComponent,
    FactNotInPipe
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        Ng2Webstorage,
        DateFormatPipe,
        FormattedNumber,
        ToQNamePipe,
        TaxonNamePipe,
        ToQNamePipe,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthenticatedHttpInterceptor,
          multi: true
        }
      ]
    };
  }
}
