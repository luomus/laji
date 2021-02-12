import { ChangeDetectionStrategy, ChangeDetectorRef, Component,
EventEmitter, Input, Output, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { TaxonAutocompleteService } from '../../shared/service/taxon-autocomplete.service';
import { BrowserService } from 'projects/laji/src/app/shared/service/browser.service';


@Component({
  selector: 'laji-taxon-select',
  template: `<input
    #typeahead
    [ngClass]="{loading: typeaheadLoading}"
    type="text"
    container="{{containerTypeAhead}}"
    [class]="class"
    [name]="name"
    [placeholder]="placeholder"
    [(ngModel)]="_taxonName"
    [typeahead]="dataSource"
    [typeaheadOptionsLimit]="typeaheadLimit"
    [typeaheadWaitMs]="200"
    [typeaheadMinLength]="3"
    [typeaheadSelectFirstItem]="!allowInvalid"
    [typeaheadOptionField]="'autocompleteSelectedName'"
    (typeaheadLoading)="changeTypeaheadLoading($event)"
    (typeaheadOnSelect)="onTaxonSelect($event)"
    [typeaheadItemTemplate]="taxonItem"
    (keyup)="onTaxonSelect($event)"
    autocomplete="off"
    autocorrect="off">

    <ng-template #taxonItem let-model="item">
     <span class="autocomplete-container" [innerHtml]="model['autocompleteDisplayName' ]"></span>
    </ng-template>
  `,
  styleUrls: ['taxon-select.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSelectComponent implements OnInit, OnDestroy {
  @Input() searchParams = {};
  @Input() name = 'target';
  @Input() placeholder = '';
  @Input() typeaheadItemTemplate;
  @Input() allowInvalid = true;
  @Input() convertIdToName = true;
  @Input() container: string;
  @Input() class = 'form-control input-sm taxonomy-search';
  @Output() taxonIdChange = new EventEmitter<string>();

  @ViewChild('typeahead', { static: true }) typeahead;

  private typeaheadMatch: {id: string, match: string};
  private enteredValue: string;

  public _taxonName: string;
  public typeaheadLimit = 10;
  public typeaheadLoading = false;
  public containerTypeAhead: string;
  public dataSource: Observable<any>;
  currentLang: string;
  public screenWidthSub: Subscription;

  constructor(
    private lajiApi: LajiApiService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private browserService: BrowserService,
    private taxonAutocompleteService: TaxonAutocompleteService
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this._taxonName);
    })
      .pipe(
        distinctUntilChanged(),
        switchMap((token: string) => this.getTaxa(token)),
        switchMap((taxa: any[]) => this.taxonAutocompleteService.getInfo(taxa, this._taxonName)),
        switchMap((data: any[]) => {
          this.typeaheadMatch = undefined;
          if (this._taxonName) {
            const searchTerm = this._taxonName.toLowerCase();
            if (data.length > 0 && (data[0].value.toLowerCase() === searchTerm || data[0].key.toLowerCase() === searchTerm)) {
              this.typeaheadMatch = {id: data[0].key, match: this._taxonName};
              if (this.enteredValue === this._taxonName) {
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

  ngOnInit() {
    this.screenWidthSub = this.browserService.lgScreen$.subscribe(data => {
      if (data === true) {
        this.containerTypeAhead = this.container ? this.container : '';
      } else {
        this.containerTypeAhead = this.container === 'laji-taxon-browse' ? 'laji-species-form' : 'body';
      }
    });
  }

  ngOnDestroy() {
    if (this.screenWidthSub) {
      this.screenWidthSub.unsubscribe();
    }
  }

  @Input() set taxonId(id: string) {
    if (!id) {
      this._taxonName = id;
    }
    if (this._taxonName || !this.convertIdToName) {
      return;
    }
    this.getTaxa(id).pipe(
      take(1)
    ).subscribe(result => {
      this._taxonName = result[0] && result[0].value || id;
      this.cdr.markForCheck();
    });
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  onTaxonSelect(event) {
    if (!this._taxonName) {
      return this.selectValue(undefined, false);
    } else if (event.item?.autocompleteSelectedName) {
      this._taxonName = event.item.autocompleteSelectedName;
    }
    this.enteredValue = undefined;
    if (event.item?.key) {
      this.typeaheadMatch = {id: event.item.key, match: event.item.value};
      this.selectValue(event.item.key, true);
    } else if (this._taxonName === '') {
      this.selectValue(undefined, false);
    } else if (event.key === 'Enter') {
      if (this.typeaheadMatch && this.typeaheadMatch.match === this._taxonName) {
        this.selectValue(this.typeaheadMatch.id, true);
      } else {
        this.enteredValue = this._taxonName;
      }
    }
  }

  private selectValue(key: string, blur?: boolean) {
    this.taxonIdChange.emit(key);
    this._taxonName = (this.container === 'laji-taxonomy') ? '' : this._taxonName;
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
      includePayload: true,
      limit: '' + this.typeaheadLimit,
      lang: this.translate.currentLang,
      ...this.searchParams
    });
  }
}
