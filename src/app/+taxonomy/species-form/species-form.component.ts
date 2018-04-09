import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AutocompleteApi } from '../../shared/api/AutocompleteApi';
import { Observable } from 'rxjs/Observable';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';
import { SpeciesFormQuery } from './species-form-query.interface';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-species-form',
  templateUrl: './species-form.component.html',
  styleUrls: ['./species-form.component.css']
})
export class SpeciesFormComponent implements OnInit {
  @Input() searchQuery: TaxonomySearchQuery;
  @Input() filtersNgStyle: string;

  public dataSource: Observable<any>;

  public showFilter = true;

  public typeaheadLoading = false;
  public limit = 10;

  public formQuery: SpeciesFormQuery = {};
  public lastQuery: string;

  public subUpdate: Subscription;

  constructor(
    public translate: TranslateService,
    private autocompleteService: AutocompleteApi
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.formQuery.taxon);
    })
      .distinctUntilChanged()
      .switchMap((token: string) => this.getTaxa(token))
      .switchMap((data) => {
        if (this.formQuery.taxon) {
          return Observable.of(data);
        }
        return Observable.of([]);
      });
  }

  ngOnInit() {
    this.empty();

    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      res => {
        if (res.formSubmit) {
          this.queryToFormQuery();
          this.onSubmit();
        }
      });
  }

  public getTaxa(token: string, onlyFirstMatch = false): Observable<any> {
    return this.autocompleteService.autocompleteFindByField({
      field: 'taxon',
      q: token,
      limit: onlyFirstMatch ? '1' : '' + this.limit,
      includePayload: true,
      lang: this.translate.currentLang,
      informalTaxonGroup: this.searchQuery.query.informalTaxonGroupId
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

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  onTaxonSelect(event) {
    if (event.value && event.item) {
      this.searchQuery.query.target = event.item.key;
    }
    if (this.formQuery.taxon === '') {
      this.searchQuery.query.target = undefined;
    }
    this.onQueryChange();
  }

  onInvasiveToggle() {
    this.formQuery.onlyInvasive = !this.formQuery.onlyInvasive;
    if (this.formQuery.onlyInvasive) {
      this.formQuery.onlyNonInvasive = false;
    }
    this.onQueryChange();
  }

  onNonInvasiveToggle() {
    this.formQuery.onlyNonInvasive = !this.formQuery.onlyNonInvasive;
    if (this.formQuery.onlyNonInvasive) {
      this.formQuery.onlyInvasive = false;
    }
    this.onQueryChange();
  }

  onQueryChange() {
    this.onSubmit();
  }

  empty() {
    if (this.searchQuery.query) {
      this.queryToFormQuery();
      return;
    }
  }

  onSubmit() {
    this.formQueryToQuery();
    const cacheKey = JSON.stringify(this.searchQuery.query);
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.searchQuery.query = {...this.searchQuery.query};
    this.lastQuery = cacheKey;
    this.searchQuery.updateUrl(false);
    this.searchQuery.queryUpdate();
    return false;
  }

  private formQueryToQuery() {
    const query = this.searchQuery.query;
    query.onlyFinnish = this.formQuery.onlyFinnish ? true : undefined;
    query.invasiveSpeciesFilter = this.formQuery.onlyInvasive ? true : (this.formQuery.onlyNonInvasive ? false : undefined);
  }

  private queryToFormQuery() {
    const query = this.searchQuery.query;
    this.formQuery.onlyFinnish = !!query.onlyFinnish;
    this.formQuery.onlyInvasive = !!query.invasiveSpeciesFilter;
    this.formQuery.taxon = query.target;
  }
}
