import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ObservationFormQuery } from './observation-form-query.interface';
import { AreaType } from '../../shared/service/area.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable ,  Subject ,  Subscription, of as ObservableOf } from 'rxjs';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: 'laji-observation-form',
  templateUrl: './observation-form.component.html',
  styleUrls: ['./observation-form.component.css']
})
export class ObservationFormComponent implements OnInit {

  @Input() formQuery: ObservationFormQuery;
  @Input() searchQuery: WarehouseQueryInterface;
  @Input() lang: string;
  @Input() invasiveStatuses: string[] = [];
  @Input() dateFormat = 'YYYY-MM-DD';

  @Output() queryUpdate = new EventEmitter<WarehouseQueryInterface>();
  @Output() mapDraw = new EventEmitter<string>();


  showPlace = false;
  drawing = false;
  drawingShape: string;

  areaType = AreaType;
  dataSource: Observable<any>;
  taxonExtra = true;
  typeaheadLoading = false;
  autocompleteLimit = 10;
  logCoordinateAccuracyMax = 4;

  constructor(
    private lajiApi: LajiApiService,
    private userService: UserService
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.formQuery.taxon);
    })
      .distinctUntilChanged()
      .switchMap((token: string) => this.getTaxa(token))
      .switchMap((data) => {
        if (this.formQuery.taxon) {
          return ObservableOf(data);
        }
        return ObservableOf([]);
      });
  }

  ngOnInit() {
  }

  getTaxa(token: string, onlyFirstMatch = false): Observable<any> {
    return this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'taxon', {
      q: token,
      limit: onlyFirstMatch ? '1' : '' + this.autocompleteLimit,
      includePayload: true,
      lang: this.lang,
      informalTaxonGroup: this.formQuery.informalTaxonGroupId
    } as LajiApi.Query.AutocompleteQuery)
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

  updateTime(dates, target = 'time') {
    if (dates === 365) {
      const today = new Date();
      const oneJan = new Date(today.getFullYear(), 0, 1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000) - 1;
    }
    const now = moment();
    if (target === 'time') {
      this.formQuery.timeStart = now.subtract(dates, 'days').format('YYYY-MM-DD');
      this.formQuery.timeEnd = '';
      this.onFormQueryChange();
    } else if (target === 'loaded') {
      this.searchQuery.firstLoadedLaterThan = now.subtract(dates, 'days').format('YYYY-MM-DD');
      this.searchQuery.firstLoadedBefore = '';
      this.onQueryChange();
    } else {
      console.error('invalid target for updateTime');
    }
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  togglePlace(event) {
    // IE triggers this event even when not given by the
    if (!event || !event.hasOwnProperty('value')) {
      return;
    }
    this.showPlace = !this.showPlace;
  }

  onOnlyFromCollectionCheckBoxToggle() {
    this.formQuery.onlyFromCollectionSystems = !this.formQuery.onlyFromCollectionSystems;
    if (this.formQuery.onlyFromCollectionSystems === false) {
      this.searchQuery.sourceId = [];
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
    this.formQueryToQuery(this.formQuery);
    this.onAdministrativeStatusChange();
  }

  onAdministrativeStatusChange() {
    const admins = this.searchQuery.administrativeStatusId;
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

  onSystemIDChange() {
    this.formQuery.onlyFromCollectionSystems = this.searchQuery.sourceId.length === 2
      && this.searchQuery.sourceId.indexOf('KE.3') > -1
      && this.searchQuery.sourceId.indexOf('KE.167') > -1;
    this.onQueryChange();
  }

  onCheckBoxToggle(field, selectValue: any = true, isDirect = true) {
    if (isDirect) {
      this.searchQuery[field] = typeof this.searchQuery[field] === 'undefined'
      ||  this.searchQuery[field] !== selectValue
        ? selectValue : undefined;
    } else {
      const value = this.searchQuery[field];
      this.searchQuery[field] =
        typeof value === 'undefined' ||  value !==  selectValue ?
          selectValue : undefined;
    }
    this.onQueryChange();
  }

  onCountChange() {
    if ( this.searchQuery.individualCountMin === 0
      && this.searchQuery.individualCountMax === 0) {
      this.formQuery['zeroObservations'] = true;
    } else {
      this.formQuery['zeroObservations'] = false;
    }
    this.onQueryChange();
  }

  toggleZeroCheckBox() {
    this.formQuery['zeroObservations'] = !this.formQuery['zeroObservations'];
    if (this.formQuery['zeroObservations']) {
      this.searchQuery.individualCountMin = 0;
      this.searchQuery.individualCountMax = 0;
    } else {
      this.searchQuery.individualCountMin = undefined;
      this.searchQuery.individualCountMax = undefined;
    }
    this.onQueryChange();
  }

  ownItemSelected() {
    if (!this.formQuery.asEditor || !this.formQuery.asObserver) {
      delete this.searchQuery.editorOrObserverPersonToken;
    }
    if (this.formQuery.asEditor || this.formQuery.asObserver) {
      this.searchQuery.qualityIssues = 'BOTH';
    }
    this.onFormQueryChange();
  }

  onFormQueryChange() {
    this.formQueryToQuery(this.formQuery);
    this.onQueryChange();
  }


  onTaxonSelect(event) {
    if ((event.key === 'Enter' || (event.value && event.item)) && this.formQuery.taxon) {
      this.searchQuery.target = this.searchQuery.target ?
        [...this.searchQuery.target, this.formQuery.taxon] : [this.formQuery.taxon];
      this.formQuery.taxon = '';
      this.onQueryChange();
    }
  }

  updateSearchQuery(field, value) {
    this.searchQuery[field] = value;
    this.onQueryChange();
  }

  enableAccuracySlider() {
    if (!this.searchQuery.coordinateAccuracyMax) {
      this.searchQuery.coordinateAccuracyMax = 1000;
      this.onAccuracySliderChange();
    }
  }

  onAccuracySliderChange() {
    this.searchQuery.coordinateAccuracyMax = Math.pow(10, this.logCoordinateAccuracyMax);
    this.onQueryChange();
  }

  onAccuracyValueChange() {
    this.logCoordinateAccuracyMax = Math.log10(this.searchQuery.coordinateAccuracyMax);
    this.onQueryChange();
  }

  onQueryChange() {
    this.queryUpdate.emit(this.searchQuery);
  }

  private formQueryToQuery(formQuery: ObservationFormQuery) {
    const time = this.parseDate(formQuery.timeStart, formQuery.timeEnd);
    const query = this.searchQuery;

    // query.target = taxon.length > 0 ? [taxon] : undefined;
    query.time = time.length > 0 ? [time] : undefined;
    query.informalTaxonGroupId = formQuery.informalTaxonGroupId ? [formQuery.informalTaxonGroupId] : undefined;
    query.invasive = formQuery.isNotInvasive ? false : query.invasive;
    query.finnish = formQuery.isNotFinnish ? false : query.finnish;
    query.hasMedia = formQuery.hasNotMedia ? false : query.hasMedia;
    query.includeNonValidTaxa = formQuery.includeOnlyValid ? false : query.includeNonValidTaxa;
    if (formQuery.allInvasiveSpecies) {
      query.administrativeStatusId = this.invasiveStatuses.map(val => 'MX.' + val);
    }
    if (formQuery.onlyFromCollectionSystems) {
      query.sourceId = ['KE.167', 'KE.3'];
    }
    query.editorPersonToken = formQuery.asEditor ? this.userService.getToken() : undefined;
    query.observerPersonToken = formQuery.asObserver ? this.userService.getToken() : undefined;
    this.invasiveStatuses
      .map((key) => {
        const value = 'MX.' + key;
        if (!formQuery[key]) {
          if (query.administrativeStatusId) {
            const idx = query.administrativeStatusId.indexOf(value);
            if (idx > -1) {
              query.administrativeStatusId.splice(idx, 1);
            }
          }
          return;
        }
        if (!query.administrativeStatusId) {
          query.administrativeStatusId = [];
        }
        if (query.administrativeStatusId.indexOf(value) === -1) {
          query.administrativeStatusId.push(value);
        }
      });
  }

  private parseDate(start, end) {
    if (!start && !end) {
      return '';
    }
    if (
      (start && !moment(start, this.dateFormat, true).isValid()) ||
      (end && !moment(end, this.dateFormat, true).isValid())
    ) {
      return '';
    }
    return (start || '') + '/' + (end || '');
  }


}
