
import {filter, debounceTime} from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ngx-webstorage';
import { ObservationResultComponent } from '../result/observation-result.component';
import { Router } from '@angular/router';
import { WINDOW } from '@ng-toolkit/universal';
import { ObservationFormComponent } from '../form/observation-form.component';



@Component({
  selector: 'laji-observation-view',
  templateUrl: './observation-view.component.html',
  styleUrls: ['./observation-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationViewComponent implements OnInit, OnDestroy {

  @LocalStorage() public observationSettings: any;
  @Input() activeTab: string;
  @ViewChild('tabs') tabs;
  @ViewChild(ObservationResultComponent) results: ObservationResultComponent;
  @ViewChild(ObservationFormComponent) form: ObservationFormComponent;

  debouchAfterChange = 500;
  limit = 10;
  typeaheadLoading = false;
  showFilter = true;
  dateFormat = 'YYYY-MM-DD';

  drawing = false;
  drawingShape: string;
  invasiveStatuses: string[] = [
    'nationallySignificantInvasiveSpecies',
    'nationalInvasiveSpeciesStrategy',
    'otherInvasiveSpeciesList',
    'euInvasiveSpeciesList',
    'quarantinePlantPest'
  ];

  subUpdate: Subscription;
  subMap: Subscription;
  lastQuery: string;
  delayedSearchSource = new Subject<any>();
  delayedSearch = this.delayedSearchSource.asObservable();
  subSearch: Subscription;

  constructor(@Inject(WINDOW) private window: Window,
              public searchQuery: SearchQuery,
              public translate: TranslateService,
              private route: Router,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.subSearch = this.delayedSearch.pipe(
      debounceTime(this.debouchAfterChange))
      .subscribe(() => {
        this.onSubmit();
        this.cd.markForCheck();
      });

    if (!this.observationSettings) {
      this.observationSettings = { showIntro: true };
    }
    this.subUpdate = this.searchQuery.queryUpdated$.pipe(
      filter(data => data && data.formSubmit))
      .subscribe(() => this.onSubmit());
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
    if (this.subMap) {
      this.subMap.unsubscribe();
    }
    if (this.subSearch) {
      this.subSearch.unsubscribe();
    }
  }

  draw(type: string) {
    this.drawingShape = type;
    if (this.activeTab !== 'map') {
      this.route.navigate(['/observation/map'], {preserveQueryParams: true});
    }
    setTimeout(() => {
      this.results.observationMap.drawToMap(type);
    }, 100);
  }

  empty(refresh: boolean) {
    Object.keys(this.searchQuery.query).map(key => this.searchQuery.query[key] = undefined);
    this.form.empty();

    if (refresh) {
      this.onSubmit();
    }
  }

  toggleInfo() {
    this.observationSettings = {showIntro: !this.observationSettings.showIntro};
  }

  onQueryChange() {
    this.delayedSearchSource.next(true);
  }

  onSubmit() {
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

  onFilterSelect(event) {
    this.searchQuery.query = event;
    this.delayedSearchSource.next();
  }
}
