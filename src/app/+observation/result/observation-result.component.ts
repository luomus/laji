import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ObservationMapComponent } from '../../shared-modules/observation-map/observation-map/observation-map.component';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { ISettingResultList } from '../../shared/service/user.service';
import { Router } from '@angular/router';

const tabNameToIndex = {
  map: 0,
  list: 1,
  images: 2,
  species: 3,
  stats: 4,
  load: 5,
  annotation: 6
};
const tabIndexToName = {
  0: 'map',
  1: 'list',
  2: 'images',
  3: 'species',
  4: 'stats',
  5: 'load',
  6: 'annotation'
};

@Component({
  selector: 'laji-observation-result',
  templateUrl: './observation-result.component.html',
  styleUrls: ['./observation-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationResultComponent {

  @Input() query: WarehouseQueryInterface = {};
  @Input() lgScreen = true;
  @Input() unitCount: number;
  @Input() speciesCount: number;
  @Input() loadingUnits: boolean;
  @Input() loadingTaxa: boolean;
  @Input() lang: string;
  @Input() listSettings: ISettingResultList;

  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();
  @Output() listSettingsChange = new EventEmitter<ISettingResultList>();

  @ViewChild(ObservationMapComponent, { static: false }) observationMap: ObservationMapComponent;

  activated = {};
  lastTabActive = 'map';
  hasMonthDayData: boolean;
  hasYearData: boolean;
  showMenu = false;
  selectedIndex = 0;

  private _active;

  constructor(private router: Router) {}

  @Input()
  set active(value) {
    if (this._active === value) {
      return;
    }
    this._active = value;
    this.activated[value] = true;
    this.showMenu = false;
    if (value !== 'finnish') {
      this.lastTabActive = value;
    }
    this.selectedIndex = tabNameToIndex[this.active];
  }

  get active() {
    return this._active;
  }

  resetActivated() {
    this.activated = {[this._active]: true};
  }

  pickLocation(e) {
    if (!e) {
      return;
    }
    const query = {...this.query};
    if (e.coordinateVerbatim) {
      query.coordinates = [e.coordinateVerbatim + ':YKJ'];
    } else if (
      e.type === 'Polygon' &&
      e.coordinates && e.coordinates.length === 1 && e.coordinates[0].length === 5
    ) {
      query.coordinates = [
        e.coordinates[0][0][1] + ':' + e.coordinates[0][2][1] + ':' +
        e.coordinates[0][0][0] + ':' + e.coordinates[0][2][0] + ':WGS84'
      ];
    } else {
      query.coordinates = undefined;
    }
    this.queryChange.emit(query);
  }

  toggleMenuMobile() {
    this.showMenu = !this.showMenu;
  }

  onSelect(tabIndex: number) {
    this.lastTabActive = tabIndexToName[tabIndex];
    this.router.navigate(['observation', tabIndexToName[tabIndex]], {queryParams: this.query});
  }
}
