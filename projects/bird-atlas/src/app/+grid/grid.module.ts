import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GridIndexComponent } from './grid-index/grid-index.component';
import { GridInfoComponent } from './grid-info/grid-info.component';
import { routing } from './grid.routes';

@NgModule({
  imports: [
    routing,
    CommonModule
  ],
  declarations: [GridIndexComponent, GridInfoComponent]
})
export class GridModule { }