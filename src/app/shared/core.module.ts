import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { TranslateService, TranslateModule } from 'ng2-translate';
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
    let userLang = CoreModule.defaultLang || 'fi';
    translate.setDefaultLang('fi');
    translate.use(userLang);
  }
}