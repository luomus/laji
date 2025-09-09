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
import { TaxonAutocompleteService } from '../../shared/service/taxon-autocomplete.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type TaxonAutocompleteResponse = components['schemas']['TaxonAutocompleteResponse'];

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
  @Output() taxonSelect = new EventEmitter<TaxonAutocompleteResponse>();

  @ViewChild('input') inputEl!: ElementRef;

  dataSource: Observable<any>;
  value: string | undefined = '';
  result?: TaxonAutocompleteResponse;
  loading = false;
  taxonSub?: Subscription;

  private tokenMinLength = 3;
  private destroyBlurListener?: () => void;

  constructor(
    private api: LajiApiClientBService,
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

  getTaxa(query: string, onlyExact = false): Observable<any> {
    if (!query || query.length < this.tokenMinLength) {
      return of([]);
    }
    this.loading = true;
    this.cdr.markForCheck();
    return timer(onlyExact ? this.index * 100 : 0).pipe(
      switchMap(() => this.api.get('/autocomplete/taxa', { query: {
        query,
        limit: this.limit,
        matchType: 'partial',
        informalTaxonGroup: this.informalTaxonGroup,
        excludeNameTypes: this.excludeNameTypes,
        onlyFinnish: this.onlyFinnish,
        onlyInvasive: this.onlyInvasive,
        onlySpecies: this.onlySpecies
      }})),
      map(({ results }) => {
        if (this.whiteList) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          results = results.filter(item => this.whiteList!.includes(item.key as any));
        }
        if (this.blackList) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          results = results.filter(item => !this.blackList!.includes(item.key as any));
        }
        if (onlyExact) {
          if (results[0] && results[0].type && results[0].type === 'exactMatches' && (
            !results[1] || results[1].type && results[1].type !== 'exactMatches'
          )) {
            return results[0];
          }
          return {};
        }
        return results.map(item => {
          let groups = '';
          if (item.informalGroups) {
            groups = item.informalGroups.reduce((prev: string, curr: any) => prev + ' ' + curr.id, groups);
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
    this.onTaxonSelect(<TaxonAutocompleteResponse>{
      key: '',
      value: this.value,
      cursiveName: false,
      vernacularName: this.value
    });
  }

}
