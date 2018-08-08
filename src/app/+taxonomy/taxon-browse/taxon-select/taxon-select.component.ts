import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-taxon-select',
  templateUrl: './taxon-select.component.html',
  styleUrls: ['./taxon-select.component.css']
})
export class TaxonSelectComponent implements OnInit {
  @Input() searchParams = {};
  @Output() onSelect = new EventEmitter<string>();

  public openTaxon: string;
  public typeaheadMatch: string;
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
              this.typeaheadMatch = data[0].key;
            }
            return ObservableOf(data);
          }
          return ObservableOf([]);
        })
      );
  }

  ngOnInit() {
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  onTaxonSelect(event) {
    if (event.item && event.item.key) {
      this.onSelect.emit(event.item.key);
    } else if (event.key === 'Enter' && this.typeaheadMatch) {
      this.onSelect.emit(this.typeaheadMatch);
    }
    if (this.openTaxon === '') {
      this.onSelect.emit(undefined);
    }
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
