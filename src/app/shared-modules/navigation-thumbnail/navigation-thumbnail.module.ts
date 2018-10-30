import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationThumbnailComponent } from './navigation-thumbnail.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  declarations: [NavigationThumbnailComponent],
  exports: [NavigationThumbnailComponent]
})
export class NavigationThumbnailModule { }
