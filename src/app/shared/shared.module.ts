import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TooltipModule, TabsModule, PaginationModule, DropdownModule, AlertModule, ModalModule } from 'ng2-bootstrap';
import { TranslateModule } from 'ng2-translate';
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
import { ImageModal } from './image-gallery/image-modal.component';
import { MapService } from './map/map.service';
import { ToQNamePipe } from './pipe/to-qname.pipe';
import { WindowRef } from './windows-ref';
import { ToFullUriPipe } from './pipe/to-full-uri';
import { GalleryComponent } from '../+observation/gallery/gallery.component';
import { AuthoritiesDirective } from './authorities/authorities.directive';


@NgModule({
  declarations: [
    NewsListComponent,
    SpinnerComponent, NotFoundComponent, ToQNamePipe, ToFullUriPipe,
    UsersPipe, LabelPipe, SafePipe, MultiLangPipe, FormattedNumber,
    ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, OnlyLoggedComponent, ImageModal,
    AuthoritiesDirective
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpModule,
    RouterModule,
    TranslateModule,
    TooltipModule, TabsModule, PaginationModule, DropdownModule, AlertModule, ModalModule
  ],
  providers: [
    NewsService, MapService, WindowRef
  ],
  exports: [
    CommonModule, HttpModule, TranslateModule,
    NewsListComponent, SpinnerComponent, UsersPipe, LabelPipe, SafePipe, MultiLangPipe, ToQNamePipe,
    ToFullUriPipe, TooltipModule, TabsModule, PaginationModule, DropdownModule, AlertModule, ModalModule,
    FormattedNumber, ObservationCountComponent, ObservationMapComponent, GalleryComponent, MapComponent,
    PanelComponent, OmniSearchComponent, OnlyLoggedComponent, ImageModal,
    AuthoritiesDirective
  ]
})
export class SharedModule {

}
