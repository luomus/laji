import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { ChecklistService } from '../service/checklist.service';
import { Observable, of } from 'rxjs';
import { Checklist } from 'projects/laji-api-client/src/lib/models/checklist';

@Pipe({
  name: 'checklist',
  pure: false
})
export class ChecklistPipe extends AbstractLabelPipe implements PipeTransform {
  private checklists?: {[id: string]: Checklist};

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected checklistService: ChecklistService) {
    super(translate, _ref);
  }

  protected _updateValue(key: string): Observable<any> {
    if (this.checklists) {
      return of(this.checklists);
    }
    const value$ = this.checklistService.getAllAsLookUp(this.translate.currentLang);
    value$.subscribe(checklists => {
      this.checklists = checklists;
    });
    return value$;
  }

  protected _parseValue(checklists: any): string {
    return this.key !== undefined && checklists[this.key] || this.key;
  }
}
