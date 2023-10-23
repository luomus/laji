import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { UsersPipe } from './pipe/users.pipe';
import { LabelPipe } from './pipe/label.pipe';
import { FormattedNumber } from './pipe/formated-number.pipe';
import { ObservationCountComponent } from '../+observation/count/observation-count.component';
import { PanelComponent } from './panel/panel.component';
import { OmniSearchComponent } from './omni-search/omni-search.component';
import { SafePipe } from './pipe/safe.pipe';
import { ImageModalComponent } from './gallery/image-gallery/image-modal.component';
import { ToQNamePipe } from './pipe/to-qname.pipe';
import { ToFullUriPipe } from './pipe/to-full-uri';
import { GalleryComponent } from './gallery/gallery/gallery.component';
import { AuthoritiesDirective } from './authorities/authorities.directive';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { AuthenticatedHttpInterceptor } from './service/authenticated-http.interceptor';
import { ImageComponent } from './gallery/image/image.component';
import { ValuesPipe } from './pipe/values.pipe';
import { CollectionNamePipe } from './pipe/collection-name.pipe';
import { AreaNamePipe } from './pipe/area-name.pipe';
import { ImageModalOverlayComponent } from './gallery/image-gallery/image-modal-overlay.component';
import { FormNamePipe } from './pipe/form-name.pipe';
import { NlToBrPipe } from './pipe/nl-to-br.pipe';
import { LocalizePipe } from '../locale/localize.pipe';
import { NotificationComponent } from './navbar/notification/notification.component';
import { HideScrollDirective } from './directive/hide-scroll';
import { FixedBelowDirective } from './directive/fixed-below.directive';
import { LangModule } from '../shared-modules/lang/lang.module';
import { SpinnerModule } from '../shared-modules/spinner/spinner.module';
import { ClickOutSideDirective } from './directive/click-out-side.directive';
import { PaginatorModule } from '../shared-modules/paginator/paginator.module';
import { InfoModule } from '../shared-modules/info/info.module';
import { ObservationGroupSelectComponent } from './group-select/observation-group-select.component';
import { IucnGroupSelectComponent } from './group-select/iucn-group-select.component';
import { SourcePipe } from './pipe/source.pipe';
import { ChecklistPipe } from './pipe/checklist.pipe';
import { TaxonNamePipe } from './pipe/taxon-name.pipe';
import { RemoveEmptyPipe } from './pipe/remove-empty.pipe';
import { DatePickerComponent } from './datepicker/datepicker.component';
import { TaxonNameComponent } from './taxon-name/taxon-name.component';
import { FactNotInPipe } from './pipe/fact-not-in.pipe';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CapitalizePipe } from './pipe/capitalize.pipe';
import { CoordinatePipe } from './pipe/coordinate.pipe';
import { FilterPipe } from './pipe/filter.pipe';
import { BoolToStringPipe } from './pipe/bool-to-string.pipe';
import { PublicationPipe } from './pipe/publication.pipe';
import { HabitatComponent } from './habitat/habitat.component';
import { LazyImageDirective } from './directive/lazy-image.directive';
import { HideForIeDirective } from './directive/hide-for-ie.directive';
import { SortPipe } from './pipe/sort.pipe';
import { DateFormatPipe, MomentModule } from 'ngx-moment';
import { UniquePipe } from './pipe/unique.pipe';
import { TruncatePipe } from './pipe/truncate.pipe';
import { NotFoundComponent } from './not-found/not-found.component';
import { AfterIfDirective } from './directive/after-if.directive';
import { FilterValuePipe } from './pipe/filter-value.pipe';
import { NotificationsComponent } from './navbar/notifications/notifications.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { WarehousePipe } from './pipe/warehouse.pipe';
import { DateCutoffFuturePipe } from './pipe/date-cutoff-future.pipe';
import { UtilitiesModule } from '../shared-modules/utilities/utilities.module';
import { IncludesPipe } from './pipe/includes.pipe';
import { SsrDisableDirective } from './directive/ssr-disable.directive';
import { TaxonDropdownComponent } from './navbar/taxon-dropdown/taxon-dropdown.component';
import { QualityUrlPipe } from './pipe/quality-url.pipe';
import { ConfirmModalComponent } from './service/confirm-modal.component';
import { CheckboxValuePipe } from './pipe/checkbox-value.pipe';
import { PluckPipe } from './pipe/pluck.pipe';
import { TranslatableIucnPipe } from './pipe/translatable-iucn.pipe';
import { ProjectFormOptionDirective } from './directive/project-form-option.directive';
import { TypeGuardPipe } from './pipe/type-guard.pipe';
import { PdfButtonComponent } from './pdf-button/pdf-button.component';
import { LayoutModule } from '@angular/cdk/layout';
import { IfWidthAboveBreakpointDirective } from './directive/if-width-above-breakpoint.directive';
import { DisableWheelDirective } from './directive/disable-wheel.directive';
import { AlertModule } from 'projects/laji-ui/src/lib/alert/alert.module';
import { PopoverModule } from 'projects/laji-ui/src/lib/popover/popover.module';
import { DropdownModule } from 'projects/laji-ui/src/lib/dropdown/dropdown.module';
import { TooltipModule } from 'projects/laji-ui/src/lib/tooltip/tooltip.module';

@NgModule({
    declarations: [
        LocalizePipe, NotificationComponent, NotificationsComponent, TaxonDropdownComponent,
        ToQNamePipe, ToFullUriPipe, ValuesPipe,
        UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, FormattedNumber,
        AreaNamePipe, TaxonNamePipe, CollectionNamePipe, FormNamePipe,
        ObservationCountComponent, GalleryComponent,
        PanelComponent, OmniSearchComponent, ImageModalComponent, ImageModalOverlayComponent,
        AuthoritiesDirective, ImageComponent, NlToBrPipe,
        HideScrollDirective, FixedBelowDirective, ClickOutSideDirective,
        ObservationGroupSelectComponent, IucnGroupSelectComponent,
        SourcePipe, RemoveEmptyPipe, DatePickerComponent,
        TaxonNameComponent, NotFoundComponent,
        ChecklistPipe,
        FactNotInPipe,
        CapitalizePipe,
        CoordinatePipe,
        FilterPipe,
        BoolToStringPipe,
        PublicationPipe,
        HabitatComponent,
        LazyImageDirective,
        HideForIeDirective,
        SortPipe,
        UniquePipe,
        TruncatePipe,
        AfterIfDirective,
        FilterValuePipe,
        WarehousePipe,
        DateCutoffFuturePipe,
        IncludesPipe,
        SsrDisableDirective,
        QualityUrlPipe,
        ConfirmModalComponent,
        CheckboxValuePipe,
        PluckPipe,
        TranslatableIucnPipe,
        ProjectFormOptionDirective,
        TypeGuardPipe,
        PdfButtonComponent,
        IfWidthAboveBreakpointDirective,
        DisableWheelDirective,
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
        ScrollingModule,
        LajiUiModule,
        DropdownModule, AlertModule, ModalModule, NgxWebstorageModule, PopoverModule,
        UtilitiesModule,
        InfoModule,
        LayoutModule,
        TooltipModule
    ],
    providers: [],
    exports: [
        CommonModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule, NotificationComponent, NotificationsComponent,
        TaxonDropdownComponent, AreaNamePipe, TaxonNamePipe, UsersPipe, LabelPipe, CollectionNamePipe, SafePipe, SpinnerModule,
        ToQNamePipe, ValuesPipe, CollectionNamePipe, FormNamePipe,
        ToFullUriPipe, TooltipModule, DropdownModule, AlertModule, ModalModule, PopoverModule,
        FormattedNumber, ObservationCountComponent, GalleryComponent,
        PanelComponent, OmniSearchComponent, ImageModalComponent, NlToBrPipe, PaginatorModule,
        AuthoritiesDirective, MomentModule, LocalizePipe, HideScrollDirective, FixedBelowDirective, ClickOutSideDirective,
        IucnGroupSelectComponent,
        ObservationGroupSelectComponent,
        SourcePipe, RemoveEmptyPipe, DatePickerComponent, TaxonNameComponent, ChecklistPipe,
        FactNotInPipe, CapitalizePipe, CoordinatePipe,
        FilterPipe, BoolToStringPipe, PublicationPipe, HabitatComponent, LazyImageDirective, HideForIeDirective, SortPipe, IncludesPipe,
        UniquePipe, TruncatePipe, LangModule, AfterIfDirective, FilterValuePipe, WarehousePipe, DateCutoffFuturePipe, UtilitiesModule,
        SsrDisableDirective,
        NotFoundComponent,
        QualityUrlPipe,
        InfoModule,
        CheckboxValuePipe,
        PluckPipe,
        TranslatableIucnPipe,
        ProjectFormOptionDirective,
        TypeGuardPipe,
        PdfButtonComponent,
        IfWidthAboveBreakpointDirective,
        DisableWheelDirective,
    ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        NgxWebstorageModule,
        DateFormatPipe,
        FormattedNumber,
        ToQNamePipe,
        TaxonNamePipe,
        ToQNamePipe,
        QualityUrlPipe,
        TranslatableIucnPipe,
        TypeGuardPipe,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthenticatedHttpInterceptor,
          multi: true
        }
      ]
    };
  }
}
