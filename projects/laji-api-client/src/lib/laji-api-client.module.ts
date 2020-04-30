import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  declarations: [],
  imports: [
  ],
  exports: []
})
export class LajiApiClientModule {
  public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<LajiApiClientModule> {
    return {
      ngModule: LajiApiClientModule,
      providers: [ { provide: Configuration, useFactory: configurationFactory } ]
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: LajiApiClientModule,
               @Optional() http: HttpClient) {
    if (parentModule) {
      throw new Error('LajiApiClientModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
        'See also https://github.com/angular/angular/issues/20575');
    }
  }
}
