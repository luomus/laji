import { NgModule, Optional, SkipSelf } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ng2-webstorage';

@NgModule({
})
export class CoreModule {

  @LocalStorage() public static defaultLang;

  constructor(translate: TranslateService, @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only!');
    }
    const userLang = CoreModule.defaultLang || 'fi';
    translate.setDefaultLang('fi');
    translate.use(userLang);
  }
}
