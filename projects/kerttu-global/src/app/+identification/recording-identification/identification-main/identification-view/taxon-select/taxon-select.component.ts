import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, of, of as ObservableOf } from 'rxjs';
import { KerttuGlobalApi } from '../../../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../../../laji/src/app/shared/service/user.service';
import { IGlobalSpecies, IGlobalSpeciesFilters, TaxonTypeEnum } from '../../../../../kerttu-global-shared/models';
import { TranslateService } from '@ngx-translate/core';

interface IGlobalSpeciesWithAutocompleteInfo extends IGlobalSpecies {
  autocompleteDisplayName: string;
}

@Component({
  selector: 'bsg-taxon-select',
  templateUrl: './taxon-select.component.html',
  styleUrls: ['./taxon-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSelectComponent {

  @Input() taxonType = TaxonTypeEnum.bird;
  @Input() limit = 10;
  @Input() placeholder = '';

  @Output() taxonSelect = new EventEmitter<IGlobalSpecies>();

  dataSource: Observable<any>;
  value? = '';
  loading = false;

  continent: number|null = null;
  filters$: Observable<IGlobalSpeciesFilters>;

  taxonTypeEnum = TaxonTypeEnum;

  private tokenMinLengthBird = 3;
  private tokenMinLengthOther = 1;

  constructor(
    private cdr: ChangeDetectorRef,
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService
  ) {
    this.filters$ = this.kerttuGlobalApi.getSpeciesFilters();

    this.dataSource = new Observable<string>((observer: any) => {
      observer.next(this.value);
    }).pipe(
      switchMap((token: string) => this.getTaxa(token)),
      switchMap((data) => ObservableOf(data))
    );
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
    const tokenMinLength = this.taxonType === TaxonTypeEnum.bird ? this.tokenMinLengthBird : this.tokenMinLengthOther;
    if (!token || token.length < tokenMinLength) {
      return of([]);
    }

    this.loading = true;
    this.cdr.markForCheck();

    return this.kerttuGlobalApi.getSpeciesList(
      this.userService.getToken(),
      this.translate.currentLang,
      {
        taxonType: this.taxonType,
        searchQuery: token,
        pageSize: this.limit,
        orderBy: ['searchQuery ASC'],
        continent: this.continent,
        includeSpeciesWithoutAudio: true
      }
    ).pipe(
      map(result => (result.results)),
      map(result => {
        result.forEach(res => {
          let autocompleteDisplayName = '';
          if (res.commonName) {
            autocompleteDisplayName += this.addBold(res.commonName, this.value) + ' - ';
          }
          autocompleteDisplayName += '<i>' + this.addBold(res.scientificName, this.value) + '</i>';
          res['autocompleteDisplayName'] = autocompleteDisplayName;
        });
        return result;
      }),
      catchError(() => ([])),
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
