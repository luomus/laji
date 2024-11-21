/**
 * TODO: Change this to use taxon-select component
 */
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { Observable, of, of as ObservableOf, Subscription, timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Autocomplete } from '../../shared/model/Autocomplete';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { TaxonAutocompleteService } from '../../shared/service/taxon-autocomplete.service';

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
  @Input() onlySpecies = false;
  @Input() showResult = true;
  @Input() clearValueOnSelect = true;
  @Input() allowEmpty = false;
  @Input() renderButton = true;
  @Input() useValue = '';
  @Input() whiteList?: string[];
  @Input() blackList?: string[];
  @Output() finish = new EventEmitter<void>();
  @Output() taxonSelect = new EventEmitter<Autocomplete>();

  @ViewChild('input') inputEl!: ElementRef;

  dataSource: Observable<any>;
  value: string | undefined = '';
  result?: Autocomplete;
  loading = false;
  taxonSub?: Subscription;

  private tokenMinLength = 3;
  private destroyBlurListener?: () => void;

  constructor(
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private taxonAutocompleteService: TaxonAutocompleteService,
    private renderer: Renderer2
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.value);
    });
    this.dataSource = this.dataSource.pipe(
      distinctUntilChanged(),
      switchMap((token: string) => this.getTaxa(token)),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      switchMap((taxa: any[]) => this.taxonAutocompleteService.getInfo(taxa, this.value!)),
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
      this.destroyBlurListener = this.renderer.listen(this.inputEl.nativeElement, 'blur', () => {
        if ((this.value?.length as any) < 1) {
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
    if (this.destroyBlurListener) {
      this.destroyBlurListener();
    }
  }

  getTaxa(token: string, onlyExact = false): Observable<any> {
    if (!token || token.length < this.tokenMinLength) {
      return of([]);
    }
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
        onlyInvasive: this.onlyInvasive,
        onlySpecies: this.onlySpecies
      })),
      map(data => {
        if (this.whiteList) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          data = data.filter(item => this.whiteList!.includes(item.key as any));
        }
        if (this.blackList) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          data = data.filter(item => !this.blackList!.includes(item.key as any));
        }
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
            groups = item.payload.informalTaxonGroups.reduce((prev: string, curr: any) => prev + ' ' + curr.id, groups);
          }
          (item as any)['groups'] = groups;
          return item;
        });
      }),
      catchError(() => of({})),
      tap(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.finish.emit();
      }));
  }

  onTaxonSelect(result: any) {
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

  keyEvent(e: any) {
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
