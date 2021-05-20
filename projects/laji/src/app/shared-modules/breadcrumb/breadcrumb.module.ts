import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangModule } from '../lang/lang.module';
import { SharedModule } from '../../shared/shared.module';
import { ThemeBreadcrumbComponent } from './theme-breadcrumb/theme-breadcrumb.component';

@NgModule({
  imports: [
    CommonModule,
    LangModule,
    SharedModule
  ],
  declarations: [ThemeBreadcrumbComponent],
  exports: [ThemeBreadcrumbComponent]
})
export class BreadcrumbModule { }
