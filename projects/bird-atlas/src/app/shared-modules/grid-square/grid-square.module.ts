import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GridSquareInfoComponent } from './grid-square-info.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  declarations: [ GridSquareInfoComponent ],
  exports: [GridSquareInfoComponent]
})
export class GridSquareModule {}
