import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LocationStrategy, PathLocationStrategy, DatePipe} from '@angular/common';
import {TabsModule,CarouselModule,AlertModule,DropdownModule,ModalModule,PaginationModule,TypeaheadModule } from 'ng2-bootstrap/ng2-bootstrap';

import {routing, appRoutingProviders} from "./app.routes";
import {AppComponent} from "./app.component";
import {NavbarComponent, FooterComponent} from "./shared";
import {LangSelectComponent} from "./shared/navbar/lang-select.component";
import {HomeComponent} from "./+home/home.components";
import {ObservationComponent} from "./+observation/observation.component";
import {ImageHeaderComponent} from "./+home/image-header/image-header.component";
import {OmniSearchComponent} from "./shared/omni-search/omni-search.component";
import {ObservationCountComponent} from "./+observation/count/observation-count.component";
import {ObservationMapComponent} from "./+observation/map/observation-map.component";
import {NavigationThumbnailComponent} from "./shared/navigation-thumbnail/navigation-thumbnail.component";
import {ObservationHeaderComponent} from "./+observation/header/observation-header.component";
import {ObservationFormComponent} from "./+observation/form/observation-form.component";
import {ObservationAggregateComponent} from "./+observation/aggregate/observation-aggregate.component";
import {ObservationChartComponent} from "./+observation/chart/observation-chart.component";
import {ObservationFilterComponent} from "./+observation/filter/observation-filter.component";
import {StatItemComponent} from "./+home/image-header/stat-item.component";
import {FormattedNumber} from "./shared/pipe/formated-number.pipe";
import {MapComponent} from "./shared/map/map.component";
import {ObservationActiveComponent} from "./+observation/active/observation-active.component";
import {ObservationResultComponent} from "./+observation/result/observation-result.component";
import {LabelPipe} from "./shared/pipe/label.pipe";
import {PieChartComponent} from "./shared/chart/pie/pie-chart.component";
import {ObservationResultListComponent} from "./+observation/result-list/observation-result-list.component";
import {nvD3} from "ng2-nvd3";
import {ResultListElementComponent} from "./+observation/result-list/result-list-element.component";
import {InfoCardComponent} from "./+taxonomy/info-card/info-card.component";
import {TaxonInfoComponent} from "./+taxonomy/info-card/taxon/taxon-info.component";
import {ParentsComponent} from "./+taxonomy/info-card/parents/parents.component";
import {ChildrenListComponent} from "./+taxonomy/info-card/children-list/children-list.component";
import {InformalListBreadcrumbComponent} from "./+taxonomy/informal-list-breadcrumb/informal-list-breadcrumb.component";
import {InformalListComponent} from "./+taxonomy/informal-list/informal-list.component";
import {SpeciesListComponent} from "./+taxonomy/species-list/species-list.component";
import {TreeOfLifeComponent} from "./+taxonomy/tree-of-life/tree-of-life.component";
import {PanelComponent} from "./shared/panel/panel.component";
import {ImageGalleryComponent} from "./shared/image-gallery/image-gallery.component";
import {TaxonComponent} from "./+taxonomy/taxon.component";
import {CollectionComponent} from "./+collection/collection.component";
import {UserService} from "./shared/service/user.service";
import {PersonTokenApi} from "./shared/api/PersonTokenApi";
import {PersonApi} from "./shared/api/PersonApi";
import {WarehouseApi} from "./shared/api/WarehouseApi";
import {WarehouseValueMappingService} from "./shared/service/warehouse-value-mapping.service";
import {TriplestoreLabelService} from "./shared/service/triplestore-label.service";
import {MetadataApi} from "./shared/api/MetadataApi";
import {DatePickerComponent} from "./shared/datepicker/datepicker.component";
import {MetadataSelectComponent} from "./shared/metadata-select/metadata-select.component";
import {ObservationGroupSelectComponent} from "./+observation/group-select/group-select.component";
import {AutocompleteApi} from "./shared/api/AutocompleteApi";
import {IUCNComponent} from "./+taxonomy/iucn/iucn.component";
import {FooterService} from "./shared/service/footer.service";
import {LocalStorageService} from "angular2-localstorage/dist";
import {SelectModule} from "ng2-select";
import {MultiRadioComponent} from "./+observation/multi-radio/multi-radio.component";
import {SharedModule} from "./shared/shared.module";
import {BrowserModule} from "@angular/platform-browser";


@NgModule({
  declarations: [
    AppComponent, NavbarComponent, FooterComponent, LangSelectComponent,
    HomeComponent, ImageHeaderComponent, OmniSearchComponent,
    ObservationGroupSelectComponent,
    ObservationCountComponent, ObservationMapComponent, NavigationThumbnailComponent,
    ObservationHeaderComponent, ObservationFormComponent,
    ObservationAggregateComponent, ObservationChartComponent, ObservationFilterComponent,
    StatItemComponent, FormattedNumber,
    MapComponent, ObservationActiveComponent, ObservationResultComponent,
    LabelPipe, PieChartComponent, ObservationResultListComponent,
    nvD3, ResultListElementComponent, InfoCardComponent, TaxonInfoComponent,
    ParentsComponent, ChildrenListComponent, InformalListBreadcrumbComponent, InformalListComponent,
    SpeciesListComponent, TreeOfLifeComponent,
    PanelComponent, ImageGalleryComponent,
    TaxonComponent, CollectionComponent, ObservationComponent,DatePickerComponent,
    MetadataSelectComponent, IUCNComponent, MultiRadioComponent
  ],
  imports: [
    BrowserModule,
    SharedModule, FormsModule, ReactiveFormsModule,
    TabsModule,CarouselModule,AlertModule,DropdownModule,ModalModule,
    PaginationModule,TypeaheadModule,
    routing, SelectModule
  ],
  providers: [
    { provide: 'Window',  useValue: window },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    PersonTokenApi, PersonApi, WarehouseApi,
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
