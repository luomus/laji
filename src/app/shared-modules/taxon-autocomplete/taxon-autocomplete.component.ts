/**
 * TODO: Change this to use taxon-select component
 */
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { Observable, of, of as ObservableOf, Subscription, timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Autocomplete } from '../../shared/model/Autocomplete';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import 'rxjs-compat/add/operator/distinctUntilChanged';
import 'rxjs-compat/add/operator/switchMap';

@Component({
  selector: 'laji-taxon-autocomplete',
  templateUrl: './taxon-autocomplete.component.html',
  styleUrls: ['./taxon-autocomplete.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonAutocompleteComponent implements AfterViewInit, OnDestroy {

  @Input() index = 0;
  @Input() limit = 10;
  @Input() placeholder = '';
  @Input() taxon = '';
  @Input() allowInvalid = false;
  @Input() informalTaxonGroup = '';
  @Input() onlyFinnish = false;
  @Input() excludeNameTypes = '';
  @Input() onlyInvasive = false;
  @Input() showResult = true;
  @Input() clearValueOnSelect = true;
  @Input() allowEmpty = false;
  @Input() renderButton = true;
  @Input() useValue = '';
  @Output() complete = new EventEmitter<void>();
  @Output() taxonSelect = new EventEmitter<Autocomplete>();

  dataSource: Observable<any>;
  value = '';
  result: Autocomplete;
  loading = false;
  taxonSub: Subscription;

  constructor(
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.value);
    });
    this.dataSource = this.dataSource.pipe(
      distinctUntilChanged(),
      switchMap((token: string) => this.getTaxa(token)),
      switchMap((data) => {
        if (this.value) {
          return ObservableOf(data);
        }
        return ObservableOf([]);
      }), );
  }

  ngAfterViewInit() {
    if (!this.renderButton && this.allowInvalid) {
      // emit empty string if input is deselected and value is empty
      document.getElementById('autocomplete-input').addEventListener('blur', () => {
        if (this.value.length < 1) {
          this.useCurrentValue();
        }
      });
    }
    this.taxonSub = this.getTaxa(this.taxon, true).subscribe(result => {
      if (result && result.key) {
        this.onTaxonSelect(result);
      } else {
        this.value = this.taxon;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (this.taxonSub) {
      this.taxonSub.unsubscribe();
    }
  }

  getTaxa(token: string, onlyExact = false): Observable<any> {
    this.loading = true;
    this.cdr.markForCheck();
    return timer(onlyExact ? this.index * 100 : 0).pipe(
      switchMap(() => this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'taxon', {
        q: token,
        limit: '' + this.limit,
        includePayload: true,
        lang: this.translateService.currentLang,
        matchType: LajiApi.AutocompleteMatchType.partial,
        informalTaxonGroup: this.informalTaxonGroup,
        excludeNameTypes: this.excludeNameTypes,
        onlyFinnish: this.onlyFinnish,
        onlyInvasive: this.onlyInvasive
      })),
      map(data => {
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
      }),
      catchError(() => of({})),
      tap(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.complete.emit();
      }));
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
