import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Pipe({
    name: 'publication',
    pure: false,
    standalone: false
})
export class PublicationPipe implements PipeTransform {
  value: any;
  lastKey?: 'name' | 'URI';
  lastField?: string;

  constructor(
    private _ref: ChangeDetectorRef,
    private api: LajiApiClientBService
  ) { }

  transform(value: any, field: 'name' | 'URI' = 'name'): any {
    if (value === this.lastKey && field === this.lastField) {
      return this.value;
    }

    this.lastKey = value;
    this.lastField = field;

    return this.updateValue(value, field);
  }

  private updateValue(value: any, field: 'name' | 'URI'): void {
    (Array.isArray(value) ? forkJoin(value.map(v => this.getValueObservable(v, field))) : this.getValueObservable(value, field))
      .subscribe(res => {
        this.value = res;
        this._ref.markForCheck();
      });
  }

  private getValueObservable(value: any, field: 'name' | 'URI') {
    if (!value || typeof value !== 'string' || value.length === 0) {
      return of(value);
    }

    return this.api.get('/publications/{id}', { path: { id: value } }).pipe(map(res => res[field] || ''));
  }
}
