import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-taxon-select',
  templateUrl: './taxon-select.component.html',
  styleUrls: ['./taxon-select.component.css']
})
export class TaxonSelectComponent {
  @Input() openTaxon: string;
  @Input() searchParams = {};
  @Output() onSelect = new EventEmitter<string>();

  @ViewChild('typeahead') typeahead;

  public typeaheadMatch: {id: string, match: string};
  public enteredValue: string;

  public typeaheadLimit = 10;
  public typeaheadLoading = false;
  public dataSource: Observable<any>;

  constructor(
    private lajiApi: LajiApiService,
    private translate: TranslateService
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.openTaxon);
    })
      .pipe(
        distinctUntilChanged(),
        switchMap((token: string) => this.getTaxa(token)),
        switchMap((data: any[]) => {
          this.typeaheadMatch = undefined;

          if (this.openTaxon) {
            const searchTerm = this.openTaxon.toLowerCase();
            if (data.length > 0 && (data[0].value.toLowerCase() === searchTerm || data[0].key.toLowerCase() === searchTerm)) {
              this.typeaheadMatch = {id: data[0].key, match: this.openTaxon};
              if (this.enteredValue === this.openTaxon) {
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

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  onTaxonSelect(event) {
    this.enteredValue = undefined;

    if (event.item && event.item.key) {
      this.typeaheadMatch = {id: event.item.key, match: event.item.value};
      this.selectValue(event.item.key, true);
    } else if (event.key === 'Enter') {
      if (this.openTaxon === '') {
        this.blur();
      } else if (this.typeaheadMatch && this.typeaheadMatch.match === this.openTaxon) {
        this.selectValue(this.typeaheadMatch.id, true);
      } else {
        this.enteredValue = this.openTaxon;
      }
    }
  }

  onBlur() {
    if (this.openTaxon === '') {
      this.selectValue(undefined, false);
    }
  }

  private selectValue(key: string, blur?: boolean) {
    this.onSelect.emit(key);
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
