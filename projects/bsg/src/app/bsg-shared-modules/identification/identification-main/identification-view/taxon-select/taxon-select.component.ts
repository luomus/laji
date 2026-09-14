import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { Observable, of, of as ObservableOf } from 'rxjs';
import { BsgApi } from '../../../../../bsg-shared/service/bsg-api';
import { UserService } from '../../../../../../../../laji/src/app/shared/service/user.service';
import {
  Species,
  SpeciesFilters,
  TaxonomyListEnum,
  TaxonTypeEnum
} from '../../../../../bsg-shared/models';
import { TranslateService } from '@ngx-translate/core';

interface IGlobalSpeciesWithAutocompleteInfo extends Species {
  autocompleteDisplayName: string;
}

@Component({
  selector: 'bsg-taxon-select',
  templateUrl: './taxon-select.component.html',
  styleUrls: ['./taxon-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TaxonSelectComponent implements OnChanges {

  @Input() taxonTypes?: TaxonTypeEnum[];
  @Input() taxonomyList?: TaxonomyListEnum;
  @Input() limit = 10;
  @Input() placeholder = '';

  @Output() taxonSelect = new EventEmitter<Species>();

  dataSource: Observable<any>;
  value? = '';
  loading = false;

  showContinentSelect = false;
  continent?: number;
  filters$: Observable<SpeciesFilters>;

  private tokenMinLengthBird = 3;
  private tokenMinLengthOther = 1;

  constructor(
    private cdr: ChangeDetectorRef,
    private bsgApi: BsgApi,
    private userService: UserService,
    private translate: TranslateService
  ) {
    this.filters$ = this.bsgApi.getSpeciesFilters();

    this.dataSource = new Observable<string>((observer: any) => {
      observer.next(this.value);
    }).pipe(
      switchMap((token: string) => this.getTaxa(token)),
      switchMap((data) => ObservableOf(data))
    );
  }

  ngOnChanges() {
    this.showContinentSelect = (!this.taxonTypes || this.taxonTypes?.includes(TaxonTypeEnum.bird)) &&
      (this.taxonomyList === undefined || this.taxonomyList === TaxonomyListEnum.default);
  }

  onTaxonSelect(result: any) {
    if (result.item) {
      result = result.item;
    }
    if (typeof result.id === 'undefined') {
      return;
    }
    this.value = '';
    this.taxonSelect.emit(result);
    this.cdr.markForCheck();
  }

  private getTaxa(token: string): Observable<IGlobalSpeciesWithAutocompleteInfo[]> {
    const tokenMinLength = !this.taxonTypes || this.taxonTypes.includes(TaxonTypeEnum.bird) ? this.tokenMinLengthBird : this.tokenMinLengthOther;
    if (!token || token.length < tokenMinLength) {
      this.loading = false;
      this.cdr.markForCheck();
      return of([]);
    }

    this.loading = true;
    this.cdr.markForCheck();

    return this.bsgApi.getSpeciesList(
      this.userService.getToken(),
      this.translate.getCurrentLang(),
      {
        taxonTypes: this.taxonTypes,
        taxonomyList: this.taxonomyList,
        searchQuery: token,
        pageSize: this.limit,
        orderBy: ['searchQuery ASC'],
        continent: this.continent,
        includeValidationStatus: true
      }
    ).pipe(
      map(result => (result.results)),
      map(result => result.map(
        res => {
          let autocompleteDisplayName = '';
          if (res.commonName) {
            autocompleteDisplayName += this.addBold(res.commonName, this.value!) + ' - ';
          }
          autocompleteDisplayName += '<i>' + this.addBold(res.scientificName, this.value!) + '</i>';
          return {...res, autocompleteDisplayName };
        })
      ),
      catchError(() => (of([] as IGlobalSpeciesWithAutocompleteInfo[]))),
      tap(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    );
  }

  private addBold(original: string, substring: string): string {
    const newOriginal = original.toLowerCase();
    const newString = substring.toLowerCase();
    const index = newOriginal.indexOf(newString);
    original = index > -1 ?
      (original.slice(0, index) + '<b>' + original.slice(index, index + substring.length) + '</b>' + original.slice(index + substring.length))
      : original;
    return original;
  }
}
