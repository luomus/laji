import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { TranslateService, TranslateModule } from 'ng2-translate';
import { LocalStorage } from 'angular2-localstorage/dist';

import { UserService } from './service/user.service';
import { NewsApi } from './api/NewsApi';

@NgModule({
  imports: [TranslateModule]
})
export class CoreModule {

  @LocalStorage() public static defaultLang;

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [ UserService, NewsApi ]
    };
  }

  constructor(translate: TranslateService, @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only!');
    }
    let userLang = CoreModule.defaultLang || 'fi';
    // Todo: uncomment whne all the translations are done
    // translate.setDefaultLang('fi');
    translate.use(userLang);
  }
}
