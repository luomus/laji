import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { NavbarComponent } from '../../shared/navbar';
import { FooterComponent } from '../../shared/footer/footer.component';
import { FeedbackComponent } from '../../shared/feedback/feedback.component';
import { ForumComponent } from '../../forum/forum.component';
import { LocaleEnComponent } from '../../locale/locale-en.component';
import { LocaleFiComponent } from '../../locale/locale-fi.component';
import { LocaleSvComponent } from '../../locale/locale-sv.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    FeedbackComponent,
    ForumComponent,
    LocaleEnComponent,
    LocaleFiComponent,
    LocaleSvComponent,
    AppComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    FeedbackComponent,
    ForumComponent,
    LocaleEnComponent,
    LocaleFiComponent,
    LocaleSvComponent,
    AppComponent
  ]
})
export class AppComponentModule { }
