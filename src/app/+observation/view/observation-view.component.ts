import { ChangeDetectionStrategy, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ObservationResultComponent } from '../result/observation-result.component';
import { Router } from '@angular/router';
import { WINDOW } from '@ng-toolkit/universal';
import { ObservationFormComponent } from '../form/observation-form.component';
import { IObservationViewModel, ObservationFacade } from '../observation.facade';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';


@Component({
  selector: 'laji-observation-view',
  templateUrl: './observation-view.component.html',
  styleUrls: ['./observation-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationViewComponent implements OnInit, OnDestroy {

  @Input() activeTab: string;
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

  subUpdate: Subscription;
  subMap: Subscription;
  subSearch: Subscription;

  vm$: Observable<IObservationViewModel>;

  constructor(
    @Inject(WINDOW) private window: Window,
    public searchQuery: SearchQuery,
    public translate: TranslateService,
    private observationFacade: ObservationFacade,
    private route: Router,
  ) {}

  ngOnInit() {
    this.vm$ = this.observationFacade.vm$;
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
}
