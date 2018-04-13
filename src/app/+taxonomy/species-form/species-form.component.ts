import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
export class SpeciesFormComponent implements OnInit, OnDestroy {
  @Input() searchQuery: TaxonomySearchQuery;
  @Input() filtersNgStyle: string;

  public dataSource: Observable<any>;

  public showFilter = true;

  public typeaheadLoading = false;
  public limit = 10;

  public formQuery: SpeciesFormQuery = {};

  public subUpdate: Subscription;

  public invasiveStatuses: string[] = [
    'nationallySignificantInvasiveSpecies',
    'nationalInvasiveSpeciesStrategy',
    'otherInvasiveSpeciesList',
    'euInvasiveSpeciesList',
    'quarantinePlantPest'
  ];

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

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
  }

  public getTaxa(token: string, onlyFirstMatch = false): Observable<any> {
    return this.autocompleteService.autocompleteFindByField({
      field: 'taxon',
      q: token,
      limit: onlyFirstMatch ? '1' : '' + this.limit,
      includePayload: true,
      lang: this.translate.currentLang,
      informalTaxonGroup: this.formQuery.informalTaxonGroupId
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

  onInvasiveCheckBoxToggle(field) {
    if (Array.isArray(field)) {
      this.formQuery.allInvasiveSpecies = !this.formQuery.allInvasiveSpecies;
      field.map(status => {this.formQuery[status] = this.formQuery.allInvasiveSpecies; });
    } else {
      this.formQuery[field] = !this.formQuery[field];
      if (!this.formQuery[field] && this.formQuery.allInvasiveSpecies) {
        this.formQuery.allInvasiveSpecies = false;
      }
    }
    this.formQueryToQuery();
    this.onAdministrativeStatusChange();
  }

  onAdministrativeStatusChange() {
    const admins = this.searchQuery.query.adminStatusFilters;
    let cnt = 0;
    this.invasiveStatuses.map(key => {
      const realKey = 'MX.' + key;
      this.formQuery[key] = admins && admins.indexOf(realKey) > -1;
      if (this.formQuery[key]) {
        cnt++;
      }
    });
    this.formQuery.allInvasiveSpecies = cnt === this.invasiveStatuses.length;
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
    this.searchQuery.updateUrl(false);
    this.searchQuery.queryUpdate();
    return false;
  }

  private formQueryToQuery() {
    const query = this.searchQuery.query;
    query.informalTaxonGroupId = this.formQuery.informalTaxonGroupId ? this.formQuery.informalTaxonGroupId : undefined;
    query.onlyFinnish = this.formQuery.onlyFinnish ? true : undefined;
    query.invasiveSpeciesFilter = this.formQuery.onlyInvasive ? true : (this.formQuery.onlyNonInvasive ? false : undefined);

    if (this.formQuery.allInvasiveSpecies) {
      query.adminStatusFilters = this.invasiveStatuses.map(val => 'MX.' + val);
    }

    this.invasiveStatuses
      .map((key) => {
        const value = 'MX.' + key;
        if (!this.formQuery[key]) {
          if (query.adminStatusFilters) {
            const idx = query.adminStatusFilters.indexOf(value);
            if (idx > -1) {
              query.adminStatusFilters.splice(idx, 1);
            }
          }
          return;
        }
        if (!query.adminStatusFilters) {
          query.adminStatusFilters = [];
        }
        if (query.adminStatusFilters.indexOf(value) === -1) {
          query.adminStatusFilters.push(value);
        }
      });

    if (query.adminStatusFilters && query.adminStatusFilters.length === 0) {
      query.adminStatusFilters = undefined;
    }
  }

  private queryToFormQuery() {
    const query = this.searchQuery.query;

    this.formQuery = {
      onlyFinnish: !!query.onlyFinnish,
      onlyInvasive: query.invasiveSpeciesFilter === true,
      onlyNonInvasive: query.invasiveSpeciesFilter === false,
      taxon: query.target,
      informalTaxonGroupId: query.informalTaxonGroupId ? query.informalTaxonGroupId : '',
      nationallySignificantInvasiveSpecies: this.hasInMulti(query.adminStatusFilters, 'MX.nationallySignificantInvasiveSpecies'),
      euInvasiveSpeciesList: this.hasInMulti(query.adminStatusFilters, 'MX.euInvasiveSpeciesList'),
      quarantinePlantPest: this.hasInMulti(query.adminStatusFilters, 'MX.quarantinePlantPest'),
      allInvasiveSpecies: this.hasInMulti(query.adminStatusFilters, this.invasiveStatuses.map(val => 'MX.' + val))
    }
  }

  private hasInMulti(multi, value, noOther = false) {
    if (Array.isArray(value)) {
      return value.filter(val => !this.hasInMulti(multi, val, noOther)).length === 0;
    }
    if (Array.isArray(multi) && multi.indexOf(value) > -1) {
      return noOther ? multi.length === (Array.isArray(value) ? value.length : 1) : true;
    }
    return false;
  }
}
