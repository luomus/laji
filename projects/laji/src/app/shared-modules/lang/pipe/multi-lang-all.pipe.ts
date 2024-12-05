import { Pipe, PipeTransform } from '@angular/core';
import { MultiLangService } from '../service/multi-lang.service';

@Pipe({
  name: 'multiLangAll',
  pure: true
})
export class MultiLangAllPipe implements PipeTransform {
  public value = '';

  transform(value: any): string {
    if (typeof value === 'string' || typeof value !== 'object') {
      return value;
    }
    this.value = this.langToString(value);
    return this.value;
  }

  private langToString(value: Record<string, unknown>) {
    return MultiLangService.valueToString(value);
  }
}
