import { ChangeDetectionStrategy, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SearchQueryService } from '../search-query.service';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ObservationResultComponent } from '../result/observation-result.component';
import { Router } from '@angular/router';
import { WINDOW } from '@ng-toolkit/universal';
import { ObservationFormComponent } from '../form/observation-form.component';
import { IObservationViewModel, ObservationFacade } from '../observation.facade';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { tap } from 'rxjs/operators';
import { PlatformService } from '../../shared/service/platform.service';


@Component({
  selector: 'laji-observation-view',
  templateUrl: './observation-view.component.html',
  styleUrls: ['./observation-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationViewComponent implements OnInit, OnDestroy {

  _activeTab: string;
  @ViewChild('tabs') tabs;
  @ViewChild(ObservationResultComponent) results: ObservationResultComponent;
  @ViewChild(ObservationFormComponent) form: ObservationFormComponent;

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

  subQueryUpdate: Subscription;

  vm$: Observable<IObservationViewModel>;

  constructor(
    @Inject(WINDOW) private window: Window,
    public searchQuery: SearchQueryService,
    public translate: TranslateService,
    private observationFacade: ObservationFacade,
    private route: Router,
    private platformService: PlatformService
  ) {}

  @Input()
  set activeTab(tab: string) {
    this._activeTab = tab;
    if (tab === 'map' && this.platformService.isBrowser) {
      setTimeout(() => {
        try {
          this.window.dispatchEvent(new Event('resize'));
        } catch (e) {
          try {
            const evt = this.window.document.createEvent('UIEvents');
            evt.initUIEvent('resize', true, false, this.window, 0);
            this.window.dispatchEvent(evt);
          } catch (e) {}
        }
      }, 100);
    }
  }

  get activeTab(): string {
    return this._activeTab;
  }

  ngOnInit() {
    this.vm$ = this.observationFacade.vm$;
    this.subQueryUpdate = this.observationFacade.query$.pipe(
      tap(() => this.results.resetActivated())
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
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

  empty() {
    this.observationFacade.clearQuery();
    this.form.empty();
  }

  toggleInfo() {
    this.observationFacade.toggleIntro();
  }

  onQueryChange(event: WarehouseQueryInterface) {
    this.observationFacade.updateQuery(event);
  }

  filterVisible(event: boolean) {
    this.observationFacade.filterVisible(event);
  }

  onAdvanceModeChange(event: boolean) {
    this.observationFacade.advanced(event);
  }

  onActiveTabChange(event: string) {
    this.observationFacade.activeTab(event);
  }
}
