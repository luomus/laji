import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AreaService } from '../service/area.service';
import { AbstractLabelPipe } from './abstract-label.pipe';
import { Observable } from 'rxjs';

@Pipe({
  name: 'area',
  pure: false
})
export class AreaNamePipe extends AbstractLabelPipe implements PipeTransform {
  private type!: 'name' | 'provinceCode';

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected areaService: AreaService) {
    super(translate, _ref);
  }

  transform(value: string, type: 'name'|'provinceCode' = 'name'): any {
    this.type = type;
    return super.transform(value);
  }

  protected _updateValue(key: string): Observable<any> {
    return this.type === 'provinceCode' ?
      this.areaService.getProvinceCode(key, this.translate.getCurrentLang()) :
      this.areaService.getName(key, this.translate.getCurrentLang());
  }

  protected _parseValue(res: string): string {
    return (res || this.key) ?? '';
  }
}
