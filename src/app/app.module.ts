import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LocationStrategy, PathLocationStrategy, DatePipe} from '@angular/common';
import {CarouselModule, ModalModule } from 'ng2-bootstrap/ng2-bootstrap';

import {routing, appRoutingProviders} from "./app.routes";
import {AppComponent} from "./app.component";
import {NavbarComponent, FooterComponent} from "./shared";
import {LangSelectComponent} from "./shared/navbar/lang-select.component";
import {HomeComponent} from "./+home/home.components";
import {ImageHeaderComponent} from "./+home/image-header/image-header.component";
import {OmniSearchComponent} from "./shared/omni-search/omni-search.component";
import {NavigationThumbnailComponent} from "./shared/navigation-thumbnail/navigation-thumbnail.component";
import {StatItemComponent} from "./+home/image-header/stat-item.component";
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
import {PersonTokenApi} from "./shared/api/PersonTokenApi";
import {PersonApi} from "./shared/api/PersonApi";
import {WarehouseApi} from "./shared/api/WarehouseApi";
import {WarehouseValueMappingService} from "./shared/service/warehouse-value-mapping.service";
import {TriplestoreLabelService} from "./shared/service/triplestore-label.service";
import {MetadataApi} from "./shared/api/MetadataApi";
import {AutocompleteApi} from "./shared/api/AutocompleteApi";
import {IUCNComponent} from "./+taxonomy/iucn/iucn.component";
import {FooterService} from "./shared/service/footer.service";
import {LocalStorageService} from "angular2-localstorage/dist";
import {SharedModule} from "./shared/shared.module";
import {BrowserModule} from "@angular/platform-browser";
import {ObservationModule} from "./+observation/observation.module";


@NgModule({
  declarations: [
    AppComponent, NavbarComponent, FooterComponent, LangSelectComponent,
    HomeComponent, ImageHeaderComponent, OmniSearchComponent,
    NavigationThumbnailComponent,
    StatItemComponent, InfoCardComponent, TaxonInfoComponent,
    ParentsComponent, ChildrenListComponent, InformalListBreadcrumbComponent, InformalListComponent,
    SpeciesListComponent, TreeOfLifeComponent, IUCNComponent,
    PanelComponent, ImageGalleryComponent, TaxonComponent, CollectionComponent
  ],
  imports: [
    BrowserModule,
    SharedModule, FormsModule, ReactiveFormsModule,
    CarouselModule,ModalModule,
    routing
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
