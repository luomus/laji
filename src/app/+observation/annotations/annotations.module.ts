import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AnnotationsComponent } from './annotations.component';
import { AnnotationListComponent } from './annotations-list/annotations-list.component';
import { LangModule } from '../../shared-modules/lang/lang.module';
import { TypeaheadModule } from 'ngx-bootstrap';
import { AnnotationListService } from './service/annotation-list.service';

@NgModule({
  imports: [
    CommonModule,
    TypeaheadModule,
    LangModule,
    SharedModule
  ],
  declarations: [AnnotationsComponent, AnnotationListComponent],
  providers: [AnnotationListService],
  exports: [AnnotationsComponent]
})
export class AnnotationModule { }




