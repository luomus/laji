import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AnnotationsComponent } from './annotations.component';
import { AnnotationListComponent } from './annotation-list/annotation-list.component';
import { AnnotationFormNewComponent } from './annotation-form-new/annotation-form-new.component';
import { LangModule } from '../lang/lang.module';
import { SearchFiltersModule } from '../search-filters/search-filters.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { OccurrenceAtTimeOfAnnotationComponent } from './annotation-list/occurrence-at-time-of-annotation/occurrence-at-time-of-annotation.component';
import { InfoModule } from '../info/info.module';
import { TooltipModule } from 'projects/laji-ui/src/lib/tooltip/tooltip.module';
import { TypeaheadModule } from 'projects/laji-ui/src/lib/typeahead/typeahead.module';
import { SelectModule } from '../select/select.module';

@NgModule({
  imports: [
    CommonModule,
    TypeaheadModule,
    LangModule,
    SharedModule,
    SearchFiltersModule,
    LajiUiModule,
    InfoModule,
    TooltipModule,
    SelectModule
  ],
  declarations: [AnnotationsComponent, AnnotationListComponent,
    AnnotationFormNewComponent, OccurrenceAtTimeOfAnnotationComponent ],
  exports: [AnnotationsComponent, LajiUiModule, InfoModule]
})
export class AnnotationsModule { }
