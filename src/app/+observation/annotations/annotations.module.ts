import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AnnotationsComponent } from './annotations.component';
import { AnnotationListComponent } from './annotations-list/annotations-list.component';
import { LangModule } from '../../shared-modules/lang/lang.module';
import { TypeaheadModule } from 'ngx-bootstrap';
import { AnnotationListService } from './service/annotation-list.service';
import { GatheringComponent } from './gathering/gathering.component';
import { GatheringRowsComponent } from './gathering-rows/gathering-rows.component';
import { TaxonNameComponent } from './taxon-name/taxon-name.component';
import { AnnotationItemComponent } from './annotation-item/annotation-item.component';

@NgModule({
  imports: [
    CommonModule,
    TypeaheadModule,
    LangModule,
    SharedModule
  ],
  declarations: [AnnotationsComponent, AnnotationListComponent,
  GatheringComponent, GatheringRowsComponent,
  TaxonNameComponent,
  AnnotationItemComponent],
  providers: [AnnotationListService],
  exports: [AnnotationsComponent]
})
export class AnnotationModule { }




