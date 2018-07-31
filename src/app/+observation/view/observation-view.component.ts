import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { Subject,  Subscription, of as ObservableOf } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ng2-webstorage';
import { ObservationResultComponent } from '../result/observation-result.component';
import { AreaType } from '../../shared/service/area.service';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { FormService } from '../../shared/service/form.service';
import { environment } from '../../../environments/environment';
import { FormPermissionService } from '../../+haseka/form-permission/form-permission.service';
import { CoordinateService } from '../../shared/service/coordinate.service';
import { LajiApiService } from '../../shared/service/laji-api.service';
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

  hasInvasiveControleRights = false;
  debouchAfterChange = 500;
  limit = 10;
  typeaheadLoading = false;
  showFilter = true;
  areaType = AreaType;
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
              private cd: ChangeDetectorRef,
              private userService: UserService,
              private lajiApi: LajiApiService,
              private formService: FormService,
              private formPermissionService: FormPermissionService,
              private coordinateService: CoordinateService) {
  }

  ngOnInit() {
    if (environment.invasiveControlForm) {
      this.formService
        .load(environment.invasiveControlForm, this.translate.currentLang)
        .delay(500)
        .switchMap((form) => this.formPermissionService.hasEditAccess(form))
        .catch(() => ObservableOf(false))
        .subscribe(hasPermission => {
          this.hasInvasiveControleRights = hasPermission;
          this.cd.markForCheck();
        });
    }

    this.subSearch = this.delayedSearch
      .debounceTime(this.debouchAfterChange)
      .subscribe(() => {
        this.onSubmit();
        this.cd.markForCheck();
      });

    if (!this.observationSettings) {
      this.observationSettings = { showIntro: true };
    }
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      res => {
        if (res.formSubmit) {
          this.onSubmit();
        }
      });
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

  toInvasiveControlForm() {
    this.formService.populate({
      URL: this.window.document.location.href,
      gatherings: [
        {
          geometry: this.coordinateService.convertLajiEtlCoordinatesToGeometry(this.searchQuery.query.coordinates)
        }
      ]
    });
    this.route.navigate(['/vihko', environment.invasiveControlForm]);
  }

}
