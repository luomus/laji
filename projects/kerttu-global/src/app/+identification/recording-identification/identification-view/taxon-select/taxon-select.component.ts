import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef
} from '@angular/core';
import { Observable, of, of as ObservableOf } from 'rxjs';
import { KerttuGlobalApi } from '../../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../../laji/src/app/shared/service/user.service';
import { IGlobalSpecies } from '../../../../kerttu-global-shared/models';

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

  @Input() limit = 10;
  @Input() placeholder = '';

  @Output() taxonSelect = new EventEmitter<IGlobalSpecies>();

  dataSource: Observable<any>;
  value? = '';
  loading = false;

  private tokenMinLength = 3;

  constructor(
    private cdr: ChangeDetectorRef,
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService
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
      })
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
    if (!token || token.length < this.tokenMinLength) {
      return of([]);
    }

    this.loading = true;
    this.cdr.markForCheck();

    return this.kerttuGlobalApi.getSpeciesList(this.userService.getToken(), {
      searchQuery: token, pageSize: this.limit, orderBy: ['searchQuery ASC']
    }).pipe(
      map(result => (result.results)),
      map(result => {
        result.forEach(res => {
          res['autocompleteDisplayName'] = this.addBold(res.commonName, this.value) + ' - <i>' + this.addBold(res.scientificName, this.value) + '</i>';
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
