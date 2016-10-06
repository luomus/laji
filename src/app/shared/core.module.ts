import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { UserService } from './service/user.service';
import { NewsApi } from './api/NewsApi';

@NgModule({
})
export class CoreModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [ UserService, NewsApi ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only!');
    }
  }
}
