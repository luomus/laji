import { Component, OnInit, Input, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AutocompleteApi } from '../../shared/api/AutocompleteApi';
import { Observable } from 'rxjs/Observable';
import { SearchQuery } from '../../+observation/search-query.model';
import { SpeciesFormQuery } from './species-form-query.interface';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-species-form',
  templateUrl: './species-form.component.html',
  styleUrls: ['./species-form.component.css']
})
export class SpeciesFormComponent implements OnInit {
  @Input() filtersNgStyle: string;

  public dataSource: Observable<any>;

  public showFilter = true;

  public typeaheadLoading = false;
  public limit = 10;

  public taxon: string;
  public formQuery: SpeciesFormQuery = {};
  public lastQuery: string;

  public subUpdate: Subscription;

  constructor(
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
    this.empty();

    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      res => {
        if (res.formSubmit) {
          this.queryToFormQuery();
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
      this.formQuery.taxonId = event.item.key;
    }
    if (this.taxon === '') {
      this.formQuery.taxonId = undefined;
    }
    this.onQueryChange();
  }

  onCheckBoxToggle(key) {
    this.formQuery[key] = !this.formQuery[key];
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
    this.searchQuery.tack++;
    this.searchQuery.updateUrl([
      'selected',
      'pageSize',
      'page'
    ], false);
    this.searchQuery.queryUpdate();
    return false;
  }

  private formQueryToQuery() {
    const query = this.searchQuery.query;
    query.informalTaxonGroupId = this.formQuery.informalTaxonGroupId ? [this.formQuery.informalTaxonGroupId] : undefined;
    query.target = this.formQuery.taxonId ? [this.formQuery.taxonId] : undefined;
    query.finnish = this.formQuery.onlyFinnish ? true : undefined;
    query.invasive = this.formQuery.onlyInvasive ? true : undefined;
  }

  private queryToFormQuery() {
    const query = this.searchQuery.query;
    this.formQuery.informalTaxonGroupId = query.informalTaxonGroupId ? query.informalTaxonGroupId[0] : undefined;
    this.formQuery.taxonId = query.target ? query.target[0] : undefined;
    this.formQuery.onlyFinnish = !!query.finnish;
    this.formQuery.onlyInvasive = !!query.invasive;
    this.taxon = '';
  }
}
