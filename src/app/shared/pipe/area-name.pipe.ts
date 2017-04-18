import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AreaService } from '../service/area.service';
import { AbsractLabelPipe } from './abstract-label.pipe';

@Pipe({
  name: 'areaName',
  pure: false
})
export class AreaNamePipe extends AbsractLabelPipe implements PipeTransform {
  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected areaService: AreaService) {
    super(translate);
  }

  protected _updateValue(key: string): void {
    this.areaService
      .getName(key, this.translate.currentLang)
      .subscribe((res: string) => {
        this.value = res ? res : key;
        this._ref.markForCheck();
      });
  }
}
