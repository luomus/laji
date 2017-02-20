import { NgModule, Optional, SkipSelf } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ng2-webstorage';
import { ActivatedRoute } from '../../../node_modules/@angular/router/src/router_state';

@NgModule({
})
export class CoreModule {

  @LocalStorage() public defaultLang;

  constructor(translate: TranslateService, @Optional() @SkipSelf() parentModule: CoreModule,  private route: ActivatedRoute) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only!');
    }
    this.route.queryParams.subscribe(params => {
      if (params['lang']) {
        this.defaultLang = params['lang'];
      }
      const userLang = this.defaultLang || 'fi';
      translate.use(userLang);
    });
    translate.setDefaultLang('fi');
  }
}
