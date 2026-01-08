import { AppComponent } from './shared-modules/app-component/app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    NoopAnimationsModule,
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {
}
