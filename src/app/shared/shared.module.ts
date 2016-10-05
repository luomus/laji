import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {TooltipModule, TabsModule, PaginationModule, DropdownModule, AlertModule, ModalModule} from "ng2-bootstrap";
import {TranslateModule, TranslateService} from "ng2-translate";
import {NewsListComponent} from "./news-list/news-list.component";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {LocalStorage} from "angular2-localstorage/dist";
import {SpinnerComponent} from "./spinner/spinner.component";
import {UsersPipe} from "./pipe/users.pipe";
import {UserService} from "./service/user.service";
import {LabelPipe} from "./pipe/label.pipe";
import {FormattedNumber} from "./pipe/formated-number.pipe";
import {ObservationCountComponent} from "../+observation/count/observation-count.component";
import {ObservationMapComponent} from "../+observation/map/observation-map.component";
import {MapComponent} from "./map/map.component";
import {PanelComponent} from "./panel/panel.component";

@NgModule({
  declarations: [
    NewsListComponent,
    SpinnerComponent,
    UsersPipe, LabelPipe, FormattedNumber,
    ObservationCountComponent, ObservationMapComponent, MapComponent,
    PanelComponent
  ],
  providers: [
    UserService
  ],
  imports: [
    CommonModule,
    HttpModule,
    RouterModule,
    TranslateModule.forRoot(),
    TooltipModule, TabsModule, PaginationModule, DropdownModule, AlertModule, ModalModule
  ],
  exports: [
    CommonModule, HttpModule, TranslateModule,
    NewsListComponent, SpinnerComponent, UsersPipe, LabelPipe,
    TooltipModule, TabsModule, PaginationModule,DropdownModule, AlertModule, ModalModule,
    FormattedNumber, ObservationCountComponent, ObservationMapComponent, MapComponent,
    PanelComponent
  ]
})
export class SharedModule {
  @LocalStorage() public static defaultLang;
  public static currentLang = 'fi';
  constructor(translate: TranslateService) {
    let userLang = SharedModule.defaultLang || translate.getBrowserLang();
    translate.setDefaultLang('fi');
    translate.use(userLang);
    SharedModule.currentLang = translate.currentLang;
  }
}
