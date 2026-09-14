import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { ChecklistService } from '../service/checklist.service';
import { Observable, of } from 'rxjs';
import { components } from 'projects/laji-api-client/generated/api.d';

type Checklist = components['schemas']['store-checklist'];

@Pipe({
    name: 'checklist',
    pure: false,
    standalone: false
})
export class ChecklistPipe extends AbstractLabelPipe implements PipeTransform {
  private checklists?: {[id: string]: Pick<Checklist, 'id' | 'name'>};

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected checklistService: ChecklistService) {
    super(translate, _ref);
  }

  protected _updateValue(key: string): Observable<any> {
    if (this.checklists) {
      return of(this.checklists);
    }
    const value$ = this.checklistService.getAllAsLookUp();
    value$.subscribe(checklists => {
      this.checklists = checklists;
    });
    return value$;
  }

  protected _parseValue(checklists: any): string {
    const item = this.key && checklists[this.key];
    return item?.name || this.key || '';
  }
}
