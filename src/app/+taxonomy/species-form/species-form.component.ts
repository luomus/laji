import { Component, OnInit, Input, HostListener } from '@angular/core';
import { WindowRef } from '../../shared/windows-ref';
import { TranslateService } from '@ngx-translate/core';
import { AutocompleteApi } from '../../shared/api/AutocompleteApi';
import { Observable } from 'rxjs/Observable';
import { SearchQuery } from '../../+observation/search-query.model';
import { SpeciesFormQuery } from './species-form-query.interface';

@Component({
  selector: 'laji-species-form',
  templateUrl: './species-form.component.html',
  styleUrls: ['./species-form.component.css']
})
export class SpeciesFormComponent implements OnInit {
  @Input() informalTaxonGroupId: string;

  public dataSource: Observable<any>;

  public filtersTop: string;
  public filtersHeight: string;
  public showFilter = true;

  public typeaheadLoading = false;
  public limit = 10;

  public taxon: string;
  public formQuery: SpeciesFormQuery;

  constructor(
    private window: WindowRef,
    public translate: TranslateService,
    private autocompleteService: AutocompleteApi,
    private searchQuery: SearchQuery
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

  ngOnInit() {
    this.formQuery = {
      informalTaxonGroupId: this.informalTaxonGroupId,
      taxonId: 'MX.37600',
      onlyFinnish: 'true'
    };
    this.onScroll();
    this.formQueryToQuery();
  }

  @HostListener('window:scroll')
  onScroll() {
    const top = 50 + Math.max(160 - this.window.nativeWindow.scrollY, 0);
    this.filtersTop = top + 'px';
    this.filtersHeight = 'calc(100vh - ' + top + 'px)';
  }

  public getTaxa(token: string, onlyFirstMatch = false): Observable<any> {
    return this.autocompleteService.autocompleteFindByField({
      field: 'taxon',
      q: token,
      limit: onlyFirstMatch ? '1' : '' + this.limit,
      includePayload: true,
      lang: this.translate.currentLang,
      informalTaxonGroup: this.informalTaxonGroupId
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

  public changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  onTaxonSelect(event) {
    if (event.value && event.item) {
      this.formQuery.taxonId = event.item.key;
    }
    if (this.taxon === '') {
      this.formQuery.taxonId = 'MX.37600';
    }
  }

  onQueryChange() {
    //this.query = Util.clone(this.formQuery);
  }

  private formQueryToQuery() {
    const query = this.searchQuery.query;
    query.informalTaxonGroupId = [this.formQuery.informalTaxonGroupId];
    query.target = [this.formQuery.taxonId];
    query.onlyFinnish = this.formQuery.onlyFinnish === 'true';
  }
}
