import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router, Params } from '@angular/router';
import { TaxonomySearchQueryInterface } from './taxonomy-search-query.interface';
import { Util } from '../shared/service/util.service';
import { UserService } from '../shared/service/user.service';

@Injectable()
export class TaxonomySearchQuery {

  public queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public page = 1;
  public sortOrder = 'taxonomic';
  public selected: string[] = [ 'id', 'taxonRank', 'scientificName', 'scientificNameAuthorship', 'vernacularName',
    'finnish', 'typeOfOccurrenceInFinland'];

  public query: TaxonomySearchQueryInterface = {};

  constructor(
    private router: Router,
    private userService: UserService
  ) {
    this.userService.getItem<any>(UserService.SETTINGS_TAXONOMY_LIST)
      .subscribe(data => {
        if (data.selected) {
          this.selected = data.selected;
          this.queryUpdate({formSubmit: false});
        }
      });
  }

  public updateUrl(skipHistory: boolean = true): void {
    const extra = {skipLocationChange: skipHistory};
    if (Object.keys(this.query).length > 0) {
      for (const key in this.query) {
        if (this.query[key] === '' || (Array.isArray(this.query[key]) && this.query[key].length === 0)) {
          this.query[key] = undefined;
        }
      }
      extra['queryParams'] = this.query;
    } else {
      extra['preserveQueryParams'] = false;
    }
    this.router.navigate(
      [],
      extra
    );
  }

  public setQueryFromParams(params: Params) {
    this.query = {};
    this.query.informalTaxonGroupId = params['informalTaxonGroupId'];
    this.query.target = params['target'];
    this.query.onlyFinnish = params['onlyFinnish'] === 'true' ? true : undefined;

    if (params['invasiveSpeciesFilter'] === 'true') {
      this.query.invasiveSpeciesFilter = true;
    }
    if (params['invasiveSpeciesFilter'] === 'false') {
      this.query.invasiveSpeciesFilter = false;
    }

    let redListFilters = params['redListStatusFilters'];
    if (redListFilters && !Array.isArray(redListFilters)) {
      redListFilters = [redListFilters];
    }
    this.query.redListStatusFilters = redListFilters;

    if (params['adminStatusFilters']) {
      let adminFilters = Util.clone(params['adminStatusFilters']);
      if (adminFilters && !Array.isArray(adminFilters)) {
        adminFilters = [adminFilters];
      }
      this.query.adminStatusFilters = adminFilters;
    }
  }

  public queryUpdate(data = {}): void {
    this.queryUpdatedSource.next(data);
  }

  public setSelectedFields(event) {
    this.selected = [...event];
    this.saveSettings();
  }

  private saveSettings() {
    this.userService.setItem(UserService.SETTINGS_TAXONOMY_LIST, {
      selected: this.selected
    }).subscribe();
  }
}
