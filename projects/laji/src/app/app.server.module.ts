import { AppComponent } from './shared-modules/app-component/app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppModule,
    ServerModule,
    NoopAnimationsModule,
    ServerTransferStateModule
  ]
})
export class AppServerModule {
}
