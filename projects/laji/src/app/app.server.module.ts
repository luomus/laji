import { AppComponent } from './shared-modules/app-component/app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

@NgModule({
  imports: [
    AppModule,
    NoopAnimationsModule,
  ],
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {
}
