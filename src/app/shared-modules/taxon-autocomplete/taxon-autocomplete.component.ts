import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable, of as ObservableOf} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Autocomplete} from '../../shared/model/Autocomplete';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';

@Component({
  selector: 'laji-taxon-autocomplete',
  templateUrl: './taxon-autocomplete.component.html',
  styleUrls: ['./taxon-autocomplete.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonAutocompleteComponent {

  @Input() limit = 10;
  @Input() placeholder = '';
  @Input() allowInvalid = false;
  @Input() informalTaxonGroup = '';
  @Input() onlyFinnish = false;
  @Input() showResult = true;
  @Input() clearValueOnSelect = true;
  @Input() allowEmpty = false;
  @Input() renderButton = true;
  @Output() taxonSelect = new EventEmitter<Autocomplete>();

  dataSource: Observable<any>;
  value = '';
  result: Autocomplete;
  loading = false;

  constructor(
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.value);
    })
      .distinctUntilChanged()
      .switchMap((token: string) => this.getTaxa(token))
      .switchMap((data) => {
        if (this.value) {
          return ObservableOf(data);
        }
        return ObservableOf([]);
      });
  }

  @Input()
  set taxon(value: string) {
    this.getTaxa(value, true)
      .subscribe(result => {
        if (result && result.key) {
          this.onTaxonSelect(result);
        } else {
          this.value = value;
          this.cdr.markForCheck();
        }
      });
  }

  getTaxa(token: string, onlyExact = false): Observable<any> {
    this.loading = true;
    this.cdr.markForCheck();
    return this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'taxon', {
      q: token,
      limit: '' + this.limit,
      includePayload: true,
      lang: this.translateService.currentLang,
      matchType: LajiApi.AutocompleteMatchType.partial,
      informalTaxonGroup: this.informalTaxonGroup,
      onlyFinnish: this.onlyFinnish
    })
      .map(data => {
        if (onlyExact) {
          if (data[0] && data[0].payload.matchType && data[0].payload.matchType === 'exactMatches' && (
            !data[1] || data[1].payload.matchType && data[1].payload.matchType !== 'exactMatches'
          )) {
            return data[0];
          }
          return {};
        }
        return data.map(item => {
          let groups = '';
          if (item.payload && item.payload.informalTaxonGroups) {
            groups = item.payload.informalTaxonGroups.reduce((prev, curr) => {
              return prev + ' ' + curr.id;
            }, groups);
          }
          item['groups'] = groups;
          return item;
        });
      })
      .do(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  onTaxonSelect(result: any, keepValue = false) {
    if (result.item) {
      result = result.item;
    }
    if (typeof result.key === 'undefined') {
      return;
    }
    if (this.clearValueOnSelect) {
      this.value = '';
    } else if (!this.value) {
      this.value = result.value;
    }
    this.result = result;
    this.taxonSelect.emit(result);
    this.cdr.markForCheck();
  }

  keyEvent(e) {
    if (e.keyCode === 13) {
      if (this.allowInvalid) {
        this.useCurrentValue();
      }
    }
  }

  useCurrentValue() {
    if (!this.allowEmpty && !this.value) {
      return;
    }
    this.onTaxonSelect(<Autocomplete>{key: '', value: this.value, payload: {
        key: '',
        cursiveName: false,
        vernacularName: this.value
      }});
  }

}
