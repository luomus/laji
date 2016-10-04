import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {TranslateModule, TranslateService} from "ng2-translate";
import {NewsListComponent} from "./news-list/news-list.component";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {LocalStorage} from "angular2-localstorage/dist";

@NgModule({
  declarations: [
    NewsListComponent
  ],
  imports: [
    CommonModule,
    HttpModule,
    RouterModule,
    TranslateModule.forRoot()
  ],
  exports: [CommonModule, HttpModule, TranslateModule, NewsListComponent],
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
