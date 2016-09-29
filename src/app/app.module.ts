import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {LocationStrategy, PathLocationStrategy, DatePipe} from '@angular/common';
import {TranslateModule} from 'ng2-translate/ng2-translate';
import { TabsModule,CarouselModule,AlertModule,DropdownModule,ModalModule,PaginationModule,TypeaheadModule, TooltipModule } from 'ng2-bootstrap/ng2-bootstrap';


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
import {NewsListComponent} from "./shared/news-list/news-list.component";
import {ObservationHeaderComponent} from "./+observation/header/observation-header.component";
import {ObservationFormComponent} from "./+observation/form/observation-form.component";
import {ObservationAggregateComponent} from "./+observation/aggregate/observation-aggregate.component";
import {ObservationChartComponent} from "./+observation/chart/observation-chart.component";
import {ObservationFilterComponent} from "./+observation/filter/observation-filter.component";
import {StatItemComponent} from "./+home/image-header/stat-item.component";
import {SpinnerComponent} from "./shared/spinner/spinner.component";
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
import {UserComponent} from "./+user/user.component";
import {UserLoginComponent} from "./+user/login/user-login.component";
import {UserLogoutComponent} from "./+user/logout/user-logout.component";
import {NewsComponent} from "./+news/news.component";
import {InformationComponent} from "./+information/information.component";
import {HaSeKaComponent} from "./+haseka/haseka.component";
import {HaSeKaFormComponent} from "./+haseka/form/haseka-form.component";
import {HaSeKaFormListComponent} from "./+haseka/form-list/haseka-form-list";
import {ShortDocumentComponent} from "./+haseka/latest/short-document.component";
import {UsersLatestComponent} from "./+haseka/latest/haseka-users-latest.component";
import {PanelComponent} from "./shared/panel/panel.component";
import {ImageGalleryComponent} from "./shared/image-gallery/image-gallery.component";
import {LajiFormComponent} from "./shared/form/laji-form.component";
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
import {HaSeKaTermsOfServiceComponent} from "./+haseka/terms-of-service/terms-of-service.component";
import {FooterService} from "./shared/service/footer.service";
import {LocalStorageService} from "angular2-localstorage/dist";
import {ProfileComponent} from "./+user/profile/profile.component";
import {FriendsComponent} from "./+user/friends/friends.component";
import {UsersPipe} from "./shared/pipe/users.pipe";


@NgModule({
  declarations: [
    AppComponent, NavbarComponent, FooterComponent, LangSelectComponent,
    HomeComponent, ImageHeaderComponent, OmniSearchComponent,
    ObservationGroupSelectComponent,
    ObservationCountComponent, ObservationMapComponent, NavigationThumbnailComponent,
    NewsListComponent, ObservationHeaderComponent, ObservationFormComponent,
    ObservationAggregateComponent, ObservationChartComponent, ObservationFilterComponent,
    StatItemComponent, SpinnerComponent, FormattedNumber,
    MapComponent, ObservationActiveComponent, ObservationResultComponent,
    LabelPipe, UsersPipe, PieChartComponent, ObservationResultListComponent,
    nvD3, ResultListElementComponent, InfoCardComponent, TaxonInfoComponent,
    ParentsComponent, ChildrenListComponent, InformalListBreadcrumbComponent, InformalListComponent,
    SpeciesListComponent, TreeOfLifeComponent, UserComponent, ProfileComponent, FriendsComponent, UserLoginComponent,
    UserLogoutComponent, NewsComponent, InformationComponent, HaSeKaComponent, HaSeKaTermsOfServiceComponent,
    HaSeKaFormComponent, HaSeKaFormListComponent, ShortDocumentComponent,
    UsersLatestComponent, PanelComponent, ImageGalleryComponent, LajiFormComponent,
    TaxonComponent, CollectionComponent, ObservationComponent,DatePickerComponent,
    MetadataSelectComponent, IUCNComponent
  ],
  imports: [
    BrowserModule, FormsModule, ReactiveFormsModule, HttpModule,
    TabsModule,CarouselModule,AlertModule,DropdownModule,ModalModule,PaginationModule,TypeaheadModule,TooltipModule,
    routing,
    TranslateModule.forRoot()
  ],
  providers: [
    { provide: 'Window',  useValue: window },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    UserService, PersonTokenApi, PersonApi, WarehouseApi,
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
