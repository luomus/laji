import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AnnotationsComponent } from './annotations.component';
import { AnnotationListComponent } from './annotation-list/annotation-list.component';
import { AnnotationFormComponent } from './annotation-form/annotation-form.component';
import { AnnotationFormNewComponent } from './annotation-form-new/annotation-form-new.component';
import { LangModule } from '../lang/lang.module';
import { TypeaheadModule } from 'ngx-bootstrap';
import { ConvertAnnotationsPipe } from './convert-annotations.pipe';
import { SearchFiltersModule } from '../search-filters/search-filters.module';

@NgModule({
  imports: [
    CommonModule,
    TypeaheadModule,
    LangModule,
    SharedModule,
    SearchFiltersModule
  ],
  declarations: [AnnotationsComponent, AnnotationListComponent, AnnotationFormComponent,
    AnnotationFormNewComponent, ConvertAnnotationsPipe ],
  exports: [AnnotationsComponent]
})
export class AnnotationsModule { }
