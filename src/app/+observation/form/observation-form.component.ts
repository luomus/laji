import { switchMap, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ObservationFormQuery } from './observation-form-query.interface';
import { AreaType } from '../../shared/service/area.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable, of as ObservableOf, Subject } from 'rxjs';
import { Util } from '../../shared/service/util.service';
import * as moment from 'moment';
import { ObservationFacade } from '../observation.facade';


@Component({
  selector: 'laji-observation-form',
  templateUrl: './observation-form.component.html',
  styleUrls: ['./observation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationFormComponent implements OnInit {

  @Input() invasiveStatuses: string[] = [];
  @Input() dateFormat = 'YYYY-MM-DD';
  @Input() advancedMode = false;

  @Output() advancedModeChange = new EventEmitter<boolean>();
  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();
  @Output() mapDraw = new EventEmitter<string>();

  formQuery: ObservationFormQuery;
  emptyFormQuery: ObservationFormQuery = {
    taxon: '',
    timeStart: '',
    timeEnd: '',
    informalTaxonGroupId: '',
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
    taxonUseAnnotated: true,
    taxonIncludeLower: true,
    coordinatesInSource: false,
  };

  showPlace = false;
  drawing = false;
  drawingShape: string;

  areaType = AreaType;
  dataSource: Observable<any>;
  typeaheadLoading = false;
  autocompleteLimit = 10;
  logCoordinateAccuracyMax = 4;

  visible: {[key: string]: boolean} = {};
  visibleAdvanced: {[key: string]: boolean} = {};

  section = {
    own: ['observerPersonToken', 'editorOrObserverPersonToken', 'editorPersonToken'],
    time: ['time', 'season', 'firstLoadedLaterThan', 'firstLoadedBefore'],
    place: [
      'countryId',
      'biogeographicalProvinceId',
      'finnishMunicipalityId',
      'area',
      'coordinates',
      'coordinateAccuracyMax',
      'sourceOfCoordinates'
    ],
    observer: ['teamMember', 'teamMemberId'],
    individual: ['sex', 'lifeStage', 'recordBasis', 'nativeOccurrence', 'breedingSite', 'individualCountMin', 'individualCountMax'],
    quality: ['taxonReliability', 'annotated', 'qualityIssues'],
    dataset: ['collectionId', 'reliabilityOfCollection', 'sourceId'],
    collection: ['collectionId', 'typeSpecimen'],
    keywords: ['documentId', 'keyword'],
    features: ['administrativeStatusId', 'redListStatusId', 'typeOfOccurrenceId', 'typeOfOccurrenceIdNot', 'invasive', 'finnish'],
    invasive: [],
    image: ['hasUnitMedia', 'hasGatheringMedia', 'hasDocumentMedia'],
    secret: ['secured', 'secureLevel'],
    identify: ['unidentified'],
  };

  advancedSections = {
    taxon: ['useIdentificationAnnotations', 'includeSubTaxa'],
    time: ['firstLoadedLaterThan', 'firstLoadedBefore'],
    coordinate: ['coordinates' , 'coordinateAccuracyMax', 'sourceOfCoordinates'],
    individual: ['sex', 'lifeStage', 'recordBasis', 'nativeOccurrence', 'breedingSite', 'individualCountMin', 'individualCountMax'],
    dataset: ['collectionId', 'reliabilityOfCollection', 'sourceId'],
    collection: ['collectionId', 'typeSpecimen'],
    keywords: ['documentId', 'keyword'],
    image: ['hasUnitMedia', 'hasGatheringMedia', 'hasDocumentMedia'],
    secure: ['secureLevel', 'secured'],
    identify: ['unidentified'],
  };

  delayedSearch = new Subject();

  private _query: WarehouseQueryInterface;

  constructor(
    private observationFacade: ObservationFacade
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.formQuery.taxon);
    });
    this.dataSource = this.dataSource.pipe(
      distinctUntilChanged(),
      switchMap((token: string) => this.observationFacade.taxaAutocomplete(token, this.formQuery.informalTaxonGroupId, 10)),
      switchMap((data) => {
        if (this.formQuery.taxon) {
          return ObservableOf(data);
        }
        return ObservableOf([]);
      }));

    this.delayedSearch.asObservable().pipe(
      debounceTime(1000)
    ).subscribe(() => this.onQueryChange());
  }

  ngOnInit() {
    this.updateVisibleSections();
  }

  empty() {
    this.formQuery = Util.clone(this.emptyFormQuery);
  }

  @Input()
  set query(query: WarehouseQueryInterface) {
    this._query = query;
    this.formQuery = this.searchQueryToFormQuery(query);
  }

  get query() {
    return this._query;
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
      this.query.firstLoadedSameOrAfter = now.subtract(dates, 'days').format('YYYY-MM-DD');
      this.query.firstLoadedSameOrBefore = undefined;
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
    this.query.sourceId = this.formQuery.onlyFromCollectionSystems ? ['KE.3', 'KE.167'] : [];
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
    const admins = this.query.administrativeStatusId;
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
    this.formQuery.onlyFromCollectionSystems = this.query.sourceId.length === 2
      && this.query.sourceId.indexOf('KE.3') > -1
      && this.query.sourceId.indexOf('KE.167') > -1;
    this.onQueryChange();
  }

  onCheckBoxToggle(field, selectValue: any = true, isDirect = true) {
    if (isDirect) {
      this.query[field] = typeof this.query[field] === 'undefined' || this.query[field] !== selectValue ? selectValue : undefined;
    } else {
      const value = this.query[field];
      this.query[field] = typeof value === 'undefined' ||  value !==  selectValue ? selectValue : undefined;
    }
    this.onQueryChange();
  }

  onCountChange() {
    this.formQuery['zeroObservations'] = this.query.individualCountMin === 0
      && this.query.individualCountMax === 0;
    this.delayedQueryChange();
  }

  onHabitatChange(habitats: any) {
    this.query.primaryHabitat = habitats.primaryHabitat;
    this.query.anyHabitat = habitats.anyHabitat;
    this.onQueryChange();
  }

  zeroObservations(only = true) {
    this.query.individualCountMin = 0;
    if (only) {
      this.query.individualCountMax = 0;
    } else if (this.query.individualCountMax === 0) {
      this.query.individualCountMax = undefined;
    }
    this.onQueryChange();
  }

  ownItemSelected() {
    if (!this.formQuery.asEditor || !this.formQuery.asObserver) {
      delete this.query.editorOrObserverPersonToken;
    }
    if (this.formQuery.asEditor || this.formQuery.asObserver) {
      this.query.qualityIssues = 'BOTH';
    }
    this.onFormQueryChange();
  }

  onFormQueryChange() {
    this.formQueryToSearchQuery(this.formQuery);
    this.onQueryChange();
  }

  onTaxonSelect(event) {
    if ((event.key === 'Enter' || (event.value && event.item)) && this.formQuery.taxon) {
      this.query['target'] = this.query['target'] ?
        [...this.query['target'], this.formQuery.taxon] : [this.formQuery.taxon];
      this.formQuery.taxon = '';
      this.onQueryChange();
    }
  }

  updateSearchQuery(field, value) {
    this.query[field] = value;
    this.onQueryChange();
  }

  enableAccuracySlider() {
    if (!this.query.coordinateAccuracyMax) {
      this.query.coordinateAccuracyMax = 1000;
      this.onAccuracySliderChange();
    }
  }

  onAccuracySliderChange() {
    this.query.coordinateAccuracyMax = Math.pow(10, this.logCoordinateAccuracyMax);
    this.onQueryChange();
  }

  onAccuracyValueChange() {
    this.logCoordinateAccuracyMax = Math.log10(this.query.coordinateAccuracyMax);
    this.delayedQueryChange();
  }

  indirectQueryChange(field, value) {
    this.query[field] = value;
    this.onQueryChange();
  }

  onQueryChange() {
    this.queryChange.emit(this.query);
    this.updateVisibleAdvancedSections();
  }

  delayedQueryChange() {
    this.delayedSearch.next();
  }

  updateTypeOfOccurrence(event) {
    this.query.typeOfOccurrenceId = event.true;
    this.query.typeOfOccurrenceIdNot = event.false;
    this.onQueryChange();
  }

  private updateVisibleSections() {
    Object.keys(this.section).forEach(section => {
      let visible = false;
      for (let i = 0; i < this.section[section].length; i++) {
        const value = this.query[this.section[section][i]];
        if ((Array.isArray(value) && value.length > 0) || typeof value !== 'undefined') {
          visible = true;
          break;
        }
      }
      this.visible[section] = visible;
    });
  }

  private updateVisibleAdvancedSections() {
    Object.keys(this.advancedSections).forEach(section => {
      let visible = false;
      for (let i = 0; i < this.advancedSections[section].length; i++) {
        const value = this.query[this.advancedSections[section][i]];
        if ((Array.isArray(value) && value.length > 0) || typeof value !== 'undefined') {
          visible = true;
          break;
        }
      }
      this.visibleAdvanced[section] = visible;
    });
  }

  private hasInMulti(multi, value) {
    if (Array.isArray(value)) {
      return value.filter(val => !this.hasInMulti(multi, val)).length === 0;
    }
    return Array.isArray(multi) && multi.indexOf(value) > -1;
  }

  private getValidDate(date) {
    if (!date || !moment(date, this.dateFormat, true).isValid()) {
      return '';
    }
    return date;
  }

  private searchQueryToFormQuery(query: WarehouseQueryInterface): ObservationFormQuery {
    const time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
    return {
      taxon: '',
      timeStart: this.getValidDate(time[0]),
      timeEnd: this.getValidDate(time[1]),
      informalTaxonGroupId: query.informalTaxonGroupId && query.informalTaxonGroupId[0] ?
        query.informalTaxonGroupId[0] : '',
      includeOnlyValid: query.includeNonValidTaxa === false ? true : undefined,
      nationallySignificantInvasiveSpecies: this.hasInMulti(query.administrativeStatusId, 'MX.nationallySignificantInvasiveSpecies'),
      euInvasiveSpeciesList: this.hasInMulti(query.administrativeStatusId, 'MX.euInvasiveSpeciesList'),
      quarantinePlantPest: this.hasInMulti(query.administrativeStatusId, 'MX.quarantinePlantPest'),
      otherInvasiveSpeciesList: this.hasInMulti(query.administrativeStatusId, 'MX.otherInvasiveSpeciesList'),
      nationalInvasiveSpeciesStrategy: this.hasInMulti(query.administrativeStatusId, 'MX.nationalInvasiveSpeciesStrategy'),
      allInvasiveSpecies: this.hasInMulti(query.administrativeStatusId, this.invasiveStatuses.map(val => 'MX.' + val)),
      onlyFromCollectionSystems: this.hasInMulti(query.sourceId, ['KE.167', 'KE.3']) && query.sourceId.length === 2,
      asObserver: !!query.observerPersonToken || !!query.editorOrObserverPersonToken,
      asEditor: !!query.editorPersonToken || !!query.editorOrObserverPersonToken,
      taxonIncludeLower: typeof query.includeSubTaxa !== 'undefined' ? query.includeSubTaxa : true,
      taxonUseAnnotated: typeof query.useIdentificationAnnotations !== 'undefined' ? query.useIdentificationAnnotations : true,
      coordinatesInSource: query.sourceOfCoordinates && query.sourceOfCoordinates === 'REPORTED_VALUE'
    };
  }

  private formQueryToSearchQuery(formQuery: ObservationFormQuery) {
    const time = this.parseDate(formQuery.timeStart, formQuery.timeEnd);
    const query = this.query;

    query.time = time.length > 0 ? [time] : undefined;
    query.informalTaxonGroupId = formQuery.informalTaxonGroupId ? [formQuery.informalTaxonGroupId] : undefined;
    query.includeNonValidTaxa = formQuery.includeOnlyValid ? false : query.includeNonValidTaxa;
    if (formQuery.allInvasiveSpecies) {
      query.administrativeStatusId = this.invasiveStatuses.map(val => 'MX.' + val);
    }
    if (formQuery.onlyFromCollectionSystems) {
      query.sourceId = ['KE.167', 'KE.3'];
    }
    query.editorPersonToken = formQuery.asEditor ? ObservationFacade.PERSON_TOKEN : undefined;
    query.observerPersonToken = formQuery.asObserver ? ObservationFacade.PERSON_TOKEN : undefined;
    query.includeSubTaxa = formQuery.taxonIncludeLower ? undefined : false;
    query.useIdentificationAnnotations = formQuery.taxonUseAnnotated ? undefined : false;
    query.sourceOfCoordinates = formQuery.coordinatesInSource ? 'REPORTED_VALUE' : undefined;
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
        const administrativeStatusId = [...query.administrativeStatusId || []];
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


  setAdvancedMode(advanced: boolean) {
    this.advancedModeChange.emit(advanced);
  }
}
