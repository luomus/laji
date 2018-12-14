import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { ChecklistService } from '../service/checklist.service';
import { Observable } from 'rxjs';

@Pipe({
  name: 'checklist',
  pure: false
})
export class ChecklistPipe extends AbstractLabelPipe implements PipeTransform {
  private checklists;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected checklistService: ChecklistService) {
    super(translate, _ref);
  }

  protected _updateValue(key: string): Observable<any> {
    if (this.checklists) {
      this.value = this.checklists[key] || key;
      return;
    }
    const value$ = this.checklistService.getAllAsLookUp(this.translate.currentLang);
    value$.subscribe(checklists => {
      this.checklists = checklists;
    });
    return value$;
  }

  protected _parseValue(checklists: any): string {
    return checklists[this.key] || this.key;
  }
}
