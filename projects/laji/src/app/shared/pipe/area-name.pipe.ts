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
  private type;

  constructor(protected translate: TranslateService,
              protected _ref: ChangeDetectorRef,
              protected areaService: AreaService) {
    super(translate, _ref);
  }

  transform(value: string, type: 'name'|'provinceCode' = 'name'): any {
    this.type = type;
    return super.transform(value);
  }

  protected _updateValue(key: string): Observable<string> {
    return this.type === 'provinceCode' ?
      this.areaService.getProvinceCode(key, this.translate.currentLang) :
      this.areaService.getName(key, this.translate.currentLang);
  }

  protected _parseValue(res: string): string {
    return res || this.key;
  }
}
