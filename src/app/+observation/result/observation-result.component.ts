import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { ObservationMapComponent } from '../../shared-modules/observation-map/observation-map/observation-map.component';
import { Subscription } from 'rxjs';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { WINDOW } from '@ng-toolkit/universal';


@Component({
  selector: 'laji-observation-result',
  templateUrl: './observation-result.component.html',
  styleUrls: ['./observation-result.component.css']
})
export class ObservationResultComponent implements OnInit, OnChanges, OnDestroy {

  @Output() activeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onFilterSelect: EventEmitter<WarehouseQueryInterface> = new EventEmitter<WarehouseQueryInterface>();

  @ViewChild(ObservationMapComponent) observationMap: ObservationMapComponent;

  public activated = {};
  public queryParams = {};
  public lastAllActive = 'map';

  private subQueryUpdate: Subscription;
  private _active;

  constructor(
    @Inject(WINDOW) private window,
    public searchQuery: SearchQuery,
    public userService: UserService,
    public translate: TranslateService
  ) {
  }

  @Input() set active(value) {
    if (this._active === value) {
      return;
    }
    this._active = value;
    if (value !== 'finnish') {
      this.lastAllActive = value;
    }
    setTimeout(() => {
      this.window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  get active() {
    return this._active;
  }

  ngOnInit() {
    this.updateQueryParams();
    this.activated[this._active] = true;
    this.subQueryUpdate = this.searchQuery.queryUpdated$
      .filter(data => !(data && data.formSubmit))
      .subscribe(() => this.updateQueryParams());
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
  }

  ngOnChanges(changes) {
    if (changes.active) {
      this.activate(this._active, true);
    }
  }


  pickLocation(e) {
    if (e.coordinateVerbatim) {
      this.searchQuery.query.coordinates = [e.coordinateVerbatim + ':YKJ'];
    } else if (
      e &&
      e.type === 'Polygon' &&
      e.coordinates && e.coordinates.length === 1 && e.coordinates[0].length === 5
    ) {
      this.searchQuery.query.coordinates = [
        e.coordinates[0][0][1] + ':' + e.coordinates[0][2][1] + ':' +
        e.coordinates[0][0][0] + ':' + e.coordinates[0][2][0] + ':WGS84'
      ];
    } else {
      this.searchQuery.query.coordinates = undefined;
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  activate(tab: string, forceUpdate = false) {
    if (!forceUpdate && this._active === tab) {
      return;
    }
    this.active = tab;
    this.activated[tab] = true;
    this.activeChange.emit(this._active);
    this.searchQuery.updateUrl([
      'selected',
      'pageSize',
      'page'
    ]);
  }

  private updateQueryParams() {
    this.queryParams = this.searchQuery.getQueryObject([
      'selected',
      'pageSize',
      'page'
    ]);
  }
}
