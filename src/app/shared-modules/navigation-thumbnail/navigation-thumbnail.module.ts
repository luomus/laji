import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationThumbnailComponent } from './navigation-thumbnail.component';
import { SharedModule } from '../../shared/shared.module';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    InfoModule
  ],
  declarations: [NavigationThumbnailComponent],
  exports: [NavigationThumbnailComponent]
})
export class NavigationThumbnailModule { }
