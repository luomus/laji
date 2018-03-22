import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AutocompleteApi, AutocompleteMatchType} from '../../../../../../shared/api/AutocompleteApi';
import {TranslateService} from '@ngx-translate/core';
import {Autocomplete} from '../../../../../../shared/model';

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
  @Output() taxonSelect = new EventEmitter<Autocomplete>();

  dataSource: Observable<any>;
  value = '';
  result: Autocomplete;

  constructor(
    private autocompleteService: AutocompleteApi,
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
          return Observable.of(data);
        }
        return Observable.of([]);
      });
  }

  @Input()
  set taxon(value: string) {
    this.value = value;
    this.getTaxa(value, true)
      .subscribe(result => {
        this.onTaxonSelect(result);
      });
  }

  getTaxa(token: string, onlyExact = false): Observable<any> {
    return this.autocompleteService.autocompleteFindByField({
      field: 'taxon',
      q: token,
      limit: '' + this.limit,
      includePayload: true,
      lang: this.translateService.currentLang,
      matchType: AutocompleteMatchType.partial
    })
      .map(data => {
        if (onlyExact) {
          if (data[0] && data[0].payload.matchType && data[0].payload.matchType === 'exactMatches') {
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
      });
  }


  onTaxonSelect(result: any) {
    if (result.item) {
      result = result.item;
    }
    this.value = '';
    this.result = result;
    this.taxonSelect.emit(result);
    this.cdr.markForCheck();
  }

  keyEvent(e) {
    if (e.keyCode === 13) {
      if (this.allowInvalid) {
        this.onTaxonSelect(<Autocomplete>{id: '', value: this.value, payload: {
            id: '',
            cursiveName: false,
            vernacularName: this.value
      }})
      }
    }
  }

}
