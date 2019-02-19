import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { distinctUntilChanged, switchMap, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';

@Component({
  selector: 'laji-taxon-select',
  template: `<input
    #typeahead
    [ngClass]="{loading: typeaheadLoading}"
    type="text"
    [class]="class"
    [name]="name"
    [placeholder]="placeholder"
    [(ngModel)]="_taxonId"
    [typeahead]="dataSource"
    [typeaheadOptionsLimit]="typeaheadLimit"
    [typeaheadWaitMs]="200"
    [typeaheadMinLength]="3"
    [typeaheadFocusFirst]="!allowInvalid"
    [typeaheadOptionField]="'value'"
    (typeaheadLoading)="changeTypeaheadLoading($event)"
    (typeaheadOnSelect)="onTaxonSelect($event)"
    [typeaheadItemTemplate]="typeaheadItemTemplate"
    (keyup)="onTaxonSelect($event)"
    autocomplete="off"
    autocorrect="off">
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSelectComponent {
  @Input() searchParams = {};
  @Input() name = 'target';
  @Input() placeholder = '';
  @Input() typeaheadItemTemplate;
  @Input() allowInvalid = true;
  @Input() convertIdToName = true;
  @Input() class = 'form-control input-sm';
  @Output() taxonIdChange = new EventEmitter<string>();

  @ViewChild('typeahead') typeahead;

  private typeaheadMatch: {id: string, match: string};
  private enteredValue: string;

  public _taxonId: string;
  public typeaheadLimit = 10;
  public typeaheadLoading = false;
  public dataSource: Observable<any>;

  constructor(
    private lajiApi: LajiApiService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this._taxonId);
    })
      .pipe(
        distinctUntilChanged(),
        switchMap((token: string) => this.getTaxa(token)),
        switchMap((data: any[]) => {
          this.typeaheadMatch = undefined;

          if (this._taxonId) {
            const searchTerm = this._taxonId.toLowerCase();
            if (data.length > 0 && (data[0].value.toLowerCase() === searchTerm || data[0].key.toLowerCase() === searchTerm)) {
              this.typeaheadMatch = {id: data[0].key, match: this._taxonId};
              if (this.enteredValue === this._taxonId) {
                this.selectValue(this.typeaheadMatch.id, true);
                return ObservableOf([]);
              }
            }
            return ObservableOf(data);
          }
          return ObservableOf([]);
        })
      );
  }

  @Input() set taxonId(id: string) {
    if (!id) {
      this._taxonId = id;
    }
    if (this._taxonId || !this.convertIdToName) {
      return;
    }
    this.getTaxa(id).pipe(
      take(1)
    ).subscribe(result => {
      this._taxonId = result[0] && result[0].value || id;
      this.cdr.markForCheck();
    });
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  onTaxonSelect(event) {
    this.enteredValue = undefined;

    if (event.item && event.item.key) {
      this.typeaheadMatch = {id: event.item.key, match: event.item.value};
      this.selectValue(event.item.key, true);
    } else if (this._taxonId === '') {
      this.selectValue(undefined, false);
    } else if (event.key === 'Enter') {
      if (this.typeaheadMatch && this.typeaheadMatch.match === this._taxonId) {
        this.selectValue(this.typeaheadMatch.id, true);
      } else {
        this.enteredValue = this._taxonId;
      }
    }
  }

  private selectValue(key: string, blur?: boolean) {
    this.taxonIdChange.emit(key);
    if (blur) {
      this.blur();
    }
  }

  private blur() {
    this.typeahead.nativeElement.blur();
  }

  public getTaxa(token: string): Observable<any> {
    return this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'taxon', {
      q: token,
      limit: '' + this.typeaheadLimit,
      lang: this.translate.currentLang,
      ...this.searchParams
    });
  }
}
