import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ObservationFormQuery } from './observation-form-query.interface';
import { AreaType } from '../../shared/service/area.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable, of as ObservableOf } from 'rxjs';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { UserService } from '../../shared/service/user.service';
import { Util } from '../../shared/service/util.service';

@Component({
  selector: 'laji-observation-form',
  templateUrl: './observation-form.component.html',
  styleUrls: ['./observation-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationFormComponent implements OnInit {

  @Input() lang: string;
  @Input() invasiveStatuses: string[] = [];
  @Input() dateFormat = 'YYYY-MM-DD';
  @Output() queryUpdate = new EventEmitter<WarehouseQueryInterface>();
  @Output() mapDraw = new EventEmitter<string>();

  formQuery: ObservationFormQuery;
  emptyFormQuery: ObservationFormQuery = {
    taxon: '',
    timeStart: '',
    timeEnd: '',
    informalTaxonGroupId: '',
    isNotFinnish: undefined,
    isNotInvasive: undefined,
    hasNotMedia: undefined,
    includeOnlyValid: undefined,
    euInvasiveSpeciesList: undefined,
    nationallySignificantInvasiveSpecies: undefined,
    quarantinePlantPest: undefined,
    otherInvasiveSpeciesList: undefined,
    nationalInvasiveSpeciesStrategy: undefined,
    allInvasiveSpecies: undefined,
    onlyFromCollectionSystems: undefined,
    asEditor: false,
    asObserver: false,
    coordinateIntersection: undefined,
    taxonUseAnnotated: true,
    taxonIncludeLower: true
  };

  _searchQuery: WarehouseQueryInterface;
  showPlace = false;
  drawing = false;
  drawingShape: string;

  areaType = AreaType;
  dataSource: Observable<any>;
  taxonExtra = false;
  areaExtra = false;
  typeaheadLoading = false;
  autocompleteLimit = 10;
  logCoordinateAccuracyMax = 4;

  constructor(
    private lajiApi: LajiApiService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
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

  empty() {
    this.formQuery = Util.clone(this.emptyFormQuery);
  }

  @Input() set searchQuery(query: WarehouseQueryInterface) {
    this._searchQuery = query;
    this.formQuery = this.searchQueryToFormQuery(query);
  }

  get searchQuery() {
    return this._searchQuery;
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
    this.formQueryToSearchQuery(this.formQuery);
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
    this.cdr.markForCheck();
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

  zeroObservations(only = true) {
    this.searchQuery.individualCountMin = 0;
    if (only) {
      this.searchQuery.individualCountMax = 0;
    } else if (this.searchQuery.individualCountMax === 0) {
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
    this.formQueryToSearchQuery(this.formQuery);
    this.onQueryChange();
  }

  onTaxonTargetChange() {
    const currentTarget = this.getTaxonTarget();
    const taxa = [];
    const query = this.searchQuery;
    ['target', 'originalTarget', 'exactTarget', 'originalExactTarget'].forEach((target) => {
      if (query[target]) {
        taxa.push(...query[target]);
        delete query[target];
      }
    });
    query[currentTarget] = taxa;
    this.onQueryChange();
  }

  onTaxonSelect(event) {
    if ((event.key === 'Enter' || (event.value && event.item)) && this.formQuery.taxon) {
      const target = this.getTaxonTarget();
      this.searchQuery[target] = this.searchQuery[target] ?
        [...this.searchQuery[target], this.formQuery.taxon] : [this.formQuery.taxon];
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

  indirectQueryChange(field, value) {
    console.log(field, value);
    this.searchQuery[field] = value;
    this.onQueryChange();
  }

  onQueryChange() {
    this.queryUpdate.emit(this.searchQuery);
  }

  private getTaxonTarget() {
    if (this.formQuery.taxonUseAnnotated) {
      return this.formQuery.taxonIncludeLower ? 'target' : 'exactTarget';
    } else {
      return this.formQuery.taxonIncludeLower ? 'originalTarget' : 'originalExactTarget';
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

  private getValidDate(date) {
    if (!date || !moment(date, this.dateFormat, true).isValid()) {
      return '';
    }
    return date;
  }

  private searchQueryToFormQuery(query: WarehouseQueryInterface): ObservationFormQuery {
    const time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
    const formQuery = {
      taxon: '',
      timeStart: this.getValidDate(time[0]),
      timeEnd: this.getValidDate(time[1]),
      informalTaxonGroupId: query.informalTaxonGroupId && query.informalTaxonGroupId[0] ?
        query.informalTaxonGroupId[0] : '',
      isNotFinnish: query.finnish === false ? true : undefined,
      isNotInvasive: query.invasive === false ? true : undefined,
      includeOnlyValid: query.includeNonValidTaxa === false ? true : undefined,
      hasNotMedia: query.hasMedia === false ? true : undefined,
      nationallySignificantInvasiveSpecies: this.hasInMulti(query.administrativeStatusId, 'MX.nationallySignificantInvasiveSpecies'),
      euInvasiveSpeciesList: this.hasInMulti(query.administrativeStatusId, 'MX.euInvasiveSpeciesList'),
      quarantinePlantPest: this.hasInMulti(query.administrativeStatusId, 'MX.quarantinePlantPest'),
      otherInvasiveSpeciesList: this.hasInMulti(query.administrativeStatusId, 'MX.otherInvasiveSpeciesList'),
      nationalInvasiveSpeciesStrategy: this.hasInMulti(query.administrativeStatusId, 'MX.nationalInvasiveSpeciesStrategy'),
      allInvasiveSpecies: this.hasInMulti(query.administrativeStatusId, this.invasiveStatuses.map(val => 'MX.' + val)),
      onlyFromCollectionSystems: this.hasInMulti(query.sourceId, ['KE.167', 'KE.3'], true),
      asObserver: !!query.observerPersonToken || !!query.editorOrObserverPersonToken,
      asEditor: !!query.editorPersonToken || !!query.editorOrObserverPersonToken,
      coordinateIntersection: true,
      taxonIncludeLower: undefined,
      taxonUseAnnotated: undefined
    };

    if (query.originalTarget) {
      formQuery.taxonIncludeLower = true;
      formQuery.taxonUseAnnotated = false;
    } else if (query.exactTarget) {
      formQuery.taxonIncludeLower = false;
      formQuery.taxonUseAnnotated = true;
    } else if (query.originalExactTarget) {
      formQuery.taxonIncludeLower = false;
      formQuery.taxonUseAnnotated = false;
    } else {
      formQuery.taxonIncludeLower = true;
      formQuery.taxonUseAnnotated = true;
    }

    return formQuery;
  }

  private formQueryToSearchQuery(formQuery: ObservationFormQuery) {
    const time = this.parseDate(formQuery.timeStart, formQuery.timeEnd);
    const query = this.searchQuery;

    query.time = time.length > 0 ? [time] : undefined;
    query.informalTaxonGroupId = formQuery.informalTaxonGroupId ? [formQuery.informalTaxonGroupId] : undefined;
    query.invasive = formQuery.isNotInvasive ? false : query.invasive;
    query.finnish = formQuery.isNotFinnish ? false : query.finnish;
    query.hasMedia = formQuery.hasNotMedia ? false : query.hasUnitMedia;
    query.includeNonValidTaxa = formQuery.includeOnlyValid ? false : query.includeNonValidTaxa;
    query._coordinatesIntersection = formQuery.coordinateIntersection ? ':1' : ':0';
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
              query.administrativeStatusId = [
                ...query.administrativeStatusId.slice(0, idx),
                ...query.administrativeStatusId.slice(idx + 1)
              ];
            }
          }
          return;
        }
        const administrativeStatusId = [...query.administrativeStatusId];
        if (administrativeStatusId.indexOf(value) === -1) {
          administrativeStatusId.push(value);
        }
        query.administrativeStatusId = administrativeStatusId;
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
