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


@NgModule({
  declarations: [
    NewsListComponent,
    SpinnerComponent,
    UsersPipe, LabelPipe, SafePipe, FormattedNumber,
    ObservationCountComponent, ObservationMapComponent, MapComponent,
    PanelComponent, OmniSearchComponent
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
  exports: [
    CommonModule, HttpModule, TranslateModule,
    NewsListComponent, SpinnerComponent, UsersPipe, LabelPipe, SafePipe,
    TooltipModule, TabsModule, PaginationModule, DropdownModule, AlertModule, ModalModule,
    FormattedNumber, ObservationCountComponent, ObservationMapComponent, MapComponent,
    PanelComponent, OmniSearchComponent
  ]
})
export class SharedModule {

}
