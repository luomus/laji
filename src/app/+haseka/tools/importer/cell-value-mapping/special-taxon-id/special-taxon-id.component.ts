import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormField} from '../../../model/form-field';
import {Observable} from 'rxjs/Observable';
import {AutocompleteApi} from '../../../../../shared/api/AutocompleteApi';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-special-taxon-id',
  templateUrl: './special-taxon-id.component.html',
  styleUrls: ['./special-taxon-id.component.css']
})
export class SpecialTaxonIdComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: FormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  dataSource: Observable<any>;
  limit = 20;
  taxon:{[key: string]: string} = {};

  constructor(
    private autocompleteService: AutocompleteApi,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.taxon);
    })
      .distinctUntilChanged()
      .switchMap((token: string) => this.getTaxa(token))
      .switchMap((data) => {
        if (this.taxon) {
          return Observable.of(data);
        }
        return Observable.of([]);
      });
  }

  public getTaxa(token: string, onlyFirstMatch = false): Observable<any> {
    return this.autocompleteService.autocompleteFindByField({
      field: 'taxon',
      q: token,
      limit: '' + this.limit,
      includePayload: true,
      lang: this.translateService.currentLang
    })
      .map(data => {
        if (onlyFirstMatch) {
          return data[0] || {};
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

  ngOnInit() {
  }

  onTaxonSelect(value, to) {
    console.log(value, to);
  }

}
