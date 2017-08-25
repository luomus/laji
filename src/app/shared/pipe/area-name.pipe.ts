import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AreaService } from '../service/area.service';
import { AbsractLabelPipe } from './abstract-label.pipe';

@Pipe({
  name: 'area',
  pure: false
})
export class AreaNamePipe extends AbsractLabelPipe implements PipeTransform {
  private type;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected areaService: AreaService) {
    super(translate);
  }

  transform(value: string, type: 'name'|'provinceCode' = 'name'): any {
    this.type = type;
    return super.transform(value);
  }

  protected _updateValue(key: string): void {
    const value$ = this.type === 'provinceCode' ?
      this.areaService.getProvinceCode(key, this.translate.currentLang) :
      this.areaService.getName(key, this.translate.currentLang);

    value$.subscribe((res: string) => {
      this.value = res ? res : key;
      this._ref.markForCheck();
    });
  }
}
