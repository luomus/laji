import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {TooltipModule} from "ng2-bootstrap";
import {TranslateModule, TranslateService} from "ng2-translate";
import {NewsListComponent} from "./news-list/news-list.component";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {LocalStorage} from "angular2-localstorage/dist";
import {SpinnerComponent} from "./spinner/spinner.component";
import {UsersPipe} from "./pipe/users.pipe";
import {UserService} from "./service/user.service";

@NgModule({
  declarations: [
    NewsListComponent,
    SpinnerComponent,
    UsersPipe
  ],
  providers: [
    UserService
  ],
  imports: [
    CommonModule,
    HttpModule,
    RouterModule,
    TranslateModule.forRoot(),
    TooltipModule
  ],
  exports: [
    CommonModule, HttpModule, TranslateModule,
    NewsListComponent, SpinnerComponent, UsersPipe,
    TooltipModule
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
