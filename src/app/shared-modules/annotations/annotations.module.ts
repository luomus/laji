import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AnnotationsComponent } from './annotations.component';
import { AnnotationListComponent } from './annotation-list/annotation-list.component';
import { AnnotationFormComponent } from './annotation-form/annotation-form.component';
import { LangModule } from '../lang/lang.module';
import { TypeaheadModule } from 'ngx-bootstrap';
import { ConvertAnnotationsPipe } from './convert-annotations.pipe';

@NgModule({
  imports: [
    CommonModule,
    TypeaheadModule,
    LangModule,
    SharedModule
  ],
  declarations: [AnnotationsComponent, AnnotationListComponent, AnnotationFormComponent, ConvertAnnotationsPipe],
  exports: [AnnotationsComponent]
})
export class AnnotationsModule { }
