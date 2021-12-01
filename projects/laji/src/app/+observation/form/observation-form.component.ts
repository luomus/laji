import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ObservationFormQuery } from './observation-form-query.interface';
import { WarehouseQueryInterface, WarehouseTimeQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable, of as ObservableOf, Subject, Subscription } from 'rxjs';
import { Util } from '../../shared/service/util.service';
import * as moment from 'moment';
import { ObservationFacade } from '../observation.facade';
import { Area } from '../../shared/model/Area';
import { isRelativeDate } from './date-form/date-form.component';
import { TaxonAutocompleteService } from '../../shared/service/taxon-autocomplete.service';
import { BrowserService } from 'projects/laji/src/app/shared/service/browser.service';
import { OwnFilterState, QualityIssuesFilterState } from './own-observations-filter/own-observations-filter.component';

interface ISections {
  taxon?: Array<keyof WarehouseQueryInterface>;
  own?: Array<keyof WarehouseQueryInterface>;
  time: Array<keyof WarehouseQueryInterface>;
  place?: Array<keyof WarehouseQueryInterface>;
  coordinate?: Array<keyof WarehouseQueryInterface>;
  sample?: Array<keyof WarehouseQueryInterface>;
  observer?: Array<keyof WarehouseQueryInterface>;
  individual: Array<keyof WarehouseQueryInterface>;
  quality: Array<keyof WarehouseQueryInterface>;
  dataset: Array<keyof WarehouseQueryInterface>;
  collection: Array<keyof WarehouseQueryInterface>;
  keywords: Array<keyof WarehouseQueryInterface>;
  features?: Array<keyof WarehouseQueryInterface>;
  invasive?: Array<keyof WarehouseQueryInterface>;
  image: Array<keyof WarehouseQueryInterface>;
  secure: Array<keyof WarehouseQueryInterface>;
}

@Component({
  selector: 'laji-observation-form',
  templateUrl: './observation-form.component.html',
  styleUrls: ['./observation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationFormComponent implements OnInit, OnDestroy {

  @Input() skipActiveFilters: string[] = [];
  @Input() invasiveStatuses: string[] = [];
  @Input() dateFormat = 'YYYY-MM-DD';

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
    controllingRisksOfInvasiveAlienSpeciesGovernment: undefined,
    quarantinePlantPest: undefined,
    qualityPlantPest: undefined,
    otherPlantPest: undefined,
    otherInvasiveSpeciesList: undefined,
    nationalInvasiveSpeciesStrategy: undefined,
    controllingRisksOfInvasiveAlienSpecies: undefined,
    allInvasiveSpecies: undefined,
    onlyFromCollectionSystems: undefined,
    asEditor: false,
    asObserver: false,
    asNotEditorOrObserver: false,
    taxonUseAnnotated: true,
    taxonIncludeLower: true,
    coordinatesInSource: false,
  };

  showPlace = false;
  drawing = false;
  drawingShape: string;
  mediaStatutes: string[] = [];

  areaType = Area.AreaType;
  dataSource: Observable<any>;
  typeaheadLoading = false;
  autocompleteLimit = 10;
  logCoordinateAccuracyMax = 4;
  selectedNameTaxon = [];

  visible: {[key in keyof ISections]?: boolean} = {};

  sections: ISections = {
    own: ['observerPersonToken', 'editorOrObserverPersonToken', 'editorPersonToken', 'editorOrObserverIsNotPersonToken'],
    time: ['time', 'season', 'firstLoadedSameOrAfter', 'firstLoadedSameOrBefore', 'loadedSameOrAfter', 'loadedSameOrBefore'],
    place: [
      'countryId',
      'provinceId',
      'biogeographicalProvinceId',
      'elyCentreId',
      'finnishMunicipalityId',
      'area',
      'coordinates',
      'coordinateAccuracyMax',
      'sourceOfCoordinates'
    ],
    sample: ['sampleType', 'sampleMaterial', 'sampleQuality', 'sampleStatus', 'sampleFact'],
    observer: ['teamMember', 'teamMemberId'],
    individual: ['sex', 'lifeStage', 'recordBasis', 'wild', 'nativeOccurrence', 'breedingSite', 'plantStatusCode', 'occurrenceCountFinlandMax', 'individualCountMin', 'individualCountMax'],
    quality: ['recordQuality', 'collectionAndRecordQuality', 'unidentified', 'needsCheck', 'annotated', 'qualityIssues', 'effectiveTag', 'collectionQuality'],
    dataset: ['collectionId', 'sourceId'],
    collection: ['collectionId', 'typeSpecimen'],
    keywords: ['documentId', 'keyword'],
    features: ['administrativeStatusId', 'redListStatusId', 'typeOfOccurrenceId', 'typeOfOccurrenceIdNot', 'invasive', 'finnish'],
    invasive: [],
    image: ['hasUnitMedia', 'hasGatheringMedia', 'hasDocumentMedia', 'hasUnitImages', 'hasUnitAudio'],
    secure: ['secured', 'secureLevel'],
  };

  delayedSearch = new Subject();
  delayedSub: Subscription;
  screenWidthSub: Subscription;
  containerTypeAhead: string;
  collectionAndRecordQualityString: any;

  private _query: WarehouseQueryInterface;

  constructor(
    private observationFacade: ObservationFacade,
    private taxonAutocompleteService: TaxonAutocompleteService,
    private browserService: BrowserService
  ) {
    this.dataSource = new Observable((subscriber: any) => {
      subscriber.next(this.formQuery.taxon);
    });
    this.dataSource = this.dataSource.pipe(
      distinctUntilChanged(),
      switchMap((token: string) => this.observationFacade.taxaAutocomplete(token, this.formQuery.informalTaxonGroupId, 10)),
      switchMap((taxa: any[]) => this.taxonAutocompleteService.getInfo(taxa, this.formQuery.taxon)),
      switchMap((data) => {
        if (this.formQuery.taxon) {
          return ObservableOf(data);
        }
        return ObservableOf([]);
      }));

    this.delayedSub = this.delayedSearch.asObservable().pipe(
      debounceTime(1000)
    ).subscribe(() => this.onQueryChange());
  }

  ngOnInit() {
    this.updateVisibleSections();
    this.screenWidthSub = this.browserService.lgScreen$.subscribe(data => {
      if (data === true) {
        this.containerTypeAhead = 'body';
      } else {
        this.containerTypeAhead = 'laji-observation-form';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.delayedSub) {
      this.delayedSub.unsubscribe();
    }

    if (this.screenWidthSub) {
      this.screenWidthSub.unsubscribe();
    }
  }

  empty() {
    this.formQuery = Util.clone(this.emptyFormQuery);
  }

  @Input()
  set query(query: WarehouseQueryInterface) {
    this._query = query;
    this.formQuery = this.searchQueryToFormQuery(query);
  }

  get query(): WarehouseQueryInterface {
    return this._query;
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
      this.query[field] = typeof this.query[field] === 'undefined' || this.query[field] !== selectValue ? selectValue : undefined;
    } else {
      const value = this.query[field];
      this.query[field] = typeof value === 'undefined' ||  value !==  selectValue ? selectValue : undefined;
    }
    this.onQueryChange();
  }

  onMediaCheckBoxToggle(field, selectValue: any = true) {
    this.mediaStatutes = this.query.hasUnitMedia ? ['hasUnitImages', 'hasUnitAudio'] :
                        (this.query.hasUnitAudio ? ['hasUnitAudio'] : (this.query.hasUnitImages ? ['hasUnitImages'] : []));
      if (Array.isArray(field)) {
          if (selectValue === true) {
            this.query.hasUnitImages = undefined;
            this.query.hasUnitAudio = undefined;
            this.query.hasUnitMedia = this.query.hasUnitMedia === undefined ? true : (this.query.hasUnitMedia === false) ? true : undefined;
            this.mediaStatutes = this.mediaStatutes.length === 2 ? [] : ['hasUnitImages', 'hasUnitAudio'];
          } else {
            this.query.hasUnitImages = undefined;
            this.query.hasUnitAudio = undefined;
            this.query.hasUnitMedia = this.query.hasUnitMedia === undefined ? false : (this.query.hasUnitMedia === true) ? false : undefined;
            this.mediaStatutes = selectValue ? this.mediaStatutes : [] ;
          }
      } else {
        if (this.mediaStatutes.length === 0) {
          this.query.hasUnitAudio = undefined;
          this.query.hasUnitImages = undefined;
        }
        if (this.mediaStatutes.indexOf(field) === -1) {
          this.mediaStatutes.push(field);
        } else {
          const index = this.mediaStatutes.indexOf(field);
          this.mediaStatutes.splice(index, 1);
        }
        this.mediaStatutes.forEach(element => {
          this.query[element] = true;
        });

        if (this.mediaStatutes.length === 2 || this.mediaStatutes.length === 0) {
          this.query.hasUnitAudio = undefined;
          this.query.hasUnitImages = undefined;
        }
        this.query.hasUnitMedia = this.mediaStatutes.length === 2 ? true : undefined;
      }
    this.onQueryChange();
  }

  onCountChange() {
    this.formQuery['zeroObservations'] = this.query.individualCountMin === 0
      && this.query.individualCountMax === 0;
    this.delayedQueryChange();
  }

  onMaxCountFinlandChange() {
    if (this.query.occurrenceCountFinlandMax > 100) {
      this.query.occurrenceCountFinlandMax = 100;
    }

    this.delayedQueryChange();
  }

  onCollectionIdChange(collections: any) {
    if (collections.collectionId) {
      this.query.collectionId = collections.collectionId;
    }

    if (collections.collectionIdNot) {
      this.query.collectionIdNot = collections.collectionIdNot;
    }

    this.onQueryChange();
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

  getOwnObservationsFilterState(): OwnFilterState {
    if (this.formQuery.asObserver && this.formQuery.asEditor) {
      return 'asBoth';
    }
    if (this.formQuery.asNotEditorOrObserver) {
      return 'asNone';
    }
    if (this.formQuery.asObserver) {
      return 'asObserver';
    }
    if (this.formQuery.asEditor) {
      return 'asEditor';
    }
    return 'unset';
  }

  getOwnQualityIssuesFilterState(): QualityIssuesFilterState {
    return this.query.qualityIssues ? <QualityIssuesFilterState>this.query.qualityIssues : 'BOTH';
  }

  onOwnObservationsFilterChange(state: OwnFilterState) {
    this.formQuery.asObserver = undefined;
    this.formQuery.asEditor = undefined;
    this.formQuery.asNotEditorOrObserver = undefined;

    switch (state) {
      case 'asBoth':
        this.formQuery.asObserver = true;
        this.formQuery.asEditor = true;
        break;
      case 'asObserver':
        this.formQuery.asObserver = true;
        break;
      case 'asEditor':
        this.formQuery.asEditor = true;
        break;
      case 'asNone':
        this.formQuery.asNotEditorOrObserver = true;
        break;
      case 'unset':
        break;
    }

    this.onFormQueryChange();
  }

  onOwnQualityIssuesFilterChange(state: QualityIssuesFilterState) {
    this.query.qualityIssues = state;
    this.onQueryChange();
  }

  onFormQueryChange() {
    this.formQueryToSearchQuery(this.formQuery);
    this.onQueryChange();
  }

  onTaxonSelect(event) {
    if ((event.key === 'Enter' || (event.value && event.item)) && this.formQuery.taxon) {
      const target = event.item && event.item.key ? event.item.key : this.formQuery.taxon;
      this.query['target'] = this.query['target'] ? [...this.query['target'], target] : [target];
      this.selectedNameTaxon.push({id: event.item ? event.item.key : this.formQuery.taxon,
        value: event.item ? event.item.autocompleteSelectedName : this.formQuery.taxon});
      this.formQuery.taxon = '';
      this.onQueryChange();
    }
  }

  updateSearchQuery(field, value) {
    this.query[field] = value;
    this.selectedNameTaxon = this.selectedNameTaxon.filter(item => {
      if (value.indexOf(item.id) > -1) {
        return item;
      }
    });
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

  subCategoryChange(event) {
    this.query.collectionAndRecordQuality = undefined;
    this.query.recordQuality = undefined;

    const categories = Object.keys(event);
    this.query.recordQuality = this.checkSubcategoriesExceptGlobalAreEquals(event, categories) ? this.keepGlobalKey(event['GLOBAL']) : undefined;
    if (this.query.recordQuality !== undefined && this.query.recordQuality.length > 0) {
      this.onQueryChange();
      return;
    }

    this.collectionAndRecordQualityString = '';
    categories.forEach(element => {
      if (element !== 'GLOBAL' && event[element].length > 0) {
        this.collectionAndRecordQualityString += element + ':' + event[element].join() + ';';
      }
    });

    this.query.collectionAndRecordQuality = this.collectionAndRecordQualityString !== '' ?
    this.collectionAndRecordQualityString : undefined;

   this.onQueryChange();
  }

  onQueryChange() {
    this.queryChange.emit(this.query);
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
    this.updateVisible('sections', 'visible');
  }

  private updateVisible(sectionKey: 'sections', visibilityKey: 'visible');
  private updateVisible(
    sectionKey: keyof Pick<this, 'sections'>,
    visibilityKey: keyof Pick<this, 'visible'>
  ) {
    Object.keys(this[sectionKey]).forEach(section => {
      let visible = false;
      for (let i = 0; i < this[sectionKey][section].length; i++) {
        const value = this.query[this[sectionKey][section][i]];
        if ((Array.isArray(value) && value.length > 0) || typeof value !== 'undefined') {
          visible = true;
          break;
        }
      }
      this[visibilityKey][section] = visible;
    });
  }

  private hasInMulti(multi, value) {
    if (Array.isArray(value)) {
      return value.filter(val => !this.hasInMulti(multi, val)).length === 0;
    }
    return Array.isArray(multi) && multi.indexOf(value) > -1;
  }

  private getValidDate(date) {
    if (date && (moment(date, this.dateFormat, true).isValid() || isRelativeDate(date))) {
      return date;
    }
    return '';
  }

  protected searchQueryToFormQuery(query: WarehouseQueryInterface): ObservationFormQuery {
    let timeStart, timeEnd;
    if (query.time && query.time[0] && isRelativeDate(query.time[0])) {
      timeStart = query.time[0];
      timeEnd = false;
    } else {
      const time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
      timeStart = time[0];
      timeEnd = time[1];
    }
    return {
      taxon: '',
      timeStart: this.getValidDate(timeStart),
      timeEnd: this.getValidDate(timeEnd),
      informalTaxonGroupId: query.informalTaxonGroupId && query.informalTaxonGroupId[0] ?
        query.informalTaxonGroupId[0] : '',
      includeOnlyValid: query.includeNonValidTaxa === false ? true : undefined,
      euInvasiveSpeciesList: this.hasInMulti(query.administrativeStatusId, 'MX.euInvasiveSpeciesList'),
      quarantinePlantPest: this.hasInMulti(query.administrativeStatusId, 'MX.quarantinePlantPest'),
      otherInvasiveSpeciesList: this.hasInMulti(query.administrativeStatusId, 'MX.otherInvasiveSpeciesList'),
      nationalInvasiveSpeciesStrategy: this.hasInMulti(query.administrativeStatusId, 'MX.nationalInvasiveSpeciesStrategy'),
      controllingRisksOfInvasiveAlienSpecies: this.hasInMulti(query.administrativeStatusId, 'MX.controllingRisksOfInvasiveAlienSpecies'),
      controllingRisksOfInvasiveAlienSpeciesGovernment: this.hasInMulti(query.administrativeStatusId, 'MX.controllingRisksOfInvasiveAlienSpeciesGovernment'),
      qualityPlantPest: this.hasInMulti(query.administrativeStatusId, 'MX.qualityPlantPest'),
      otherPlantPest: this.hasInMulti(query.administrativeStatusId, 'MX.otherPlantPest'),
      allInvasiveSpecies: this.invasiveStatuses.length > 0 && this.hasInMulti(query.administrativeStatusId, this.invasiveStatuses.map(val => 'MX.' + val)),
      onlyFromCollectionSystems: this.hasInMulti(query.sourceId, ['KE.167', 'KE.3']) && query.sourceId.length === 2,
      asObserver: !!query.observerPersonToken || !!query.editorOrObserverPersonToken,
      asEditor: !!query.editorPersonToken || !!query.editorOrObserverPersonToken,
      asNotEditorOrObserver: !!query.editorOrObserverIsNotPersonToken,
      taxonIncludeLower: typeof query.includeSubTaxa !== 'undefined' ? query.includeSubTaxa : true,
      taxonUseAnnotated: typeof query.useIdentificationAnnotations !== 'undefined' ? query.useIdentificationAnnotations : true,
      coordinatesInSource: query.sourceOfCoordinates && query.sourceOfCoordinates === 'REPORTED_VALUE'
    };
  }

  protected formQueryToSearchQuery(formQuery: ObservationFormQuery) {
    const query = this.query;
    if (isRelativeDate(formQuery.timeStart) && !formQuery.timeEnd) {
      query.time = [formQuery.timeStart];
    } else {
      const time = this.parseDate(formQuery.timeStart, formQuery.timeEnd);
      query.time = time.length > 0 ? [time] : undefined;
    }

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
    query.editorOrObserverIsNotPersonToken = formQuery.asNotEditorOrObserver ? ObservationFacade.PERSON_TOKEN : undefined;
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
        const administrativeStatusId = [...query.administrativeStatusId || []];
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

  updateTime(dates, startTarget?: 'time');
  updateTime(dates, startTarget: keyof WarehouseTimeQueryInterface, endTarget: keyof WarehouseTimeQueryInterface );
  updateTime(dates, startTarget: 'time' | keyof WarehouseTimeQueryInterface = 'time', endTarget?: keyof WarehouseTimeQueryInterface ) {
    if (dates === 365) {
      const today = new Date();
      const oneJan = new Date(today.getFullYear(), 0, 1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000) - 1;
    }
    const now = moment();
    if (startTarget === 'time') {
      this.formQuery.timeStart = now.subtract(dates, 'days').format('YYYY-MM-DD');
      this.formQuery.timeEnd = '';
      this.onFormQueryChange();
    } else {
      this.query[startTarget] = now.subtract(dates, 'days').format('YYYY-MM-DD');
      this.query[endTarget] = undefined;
      this.onQueryChange();
    }
  }

  private checkSubcategoriesExceptGlobalAreEquals(selected, categories) {
    const keys = Object.keys(selected);
    const filteredKeys = keys.filter(item => item !== 'GLOBAL');

    if (filteredKeys.length === 0) {
      return true;
    }

    if (filteredKeys.length < categories.length - 1) {
      return false;
    }

    for (let i = 0; i < filteredKeys.length - 1; i++) {
      if (!Util.equalsArray(selected[filteredKeys[i]], selected[filteredKeys[i + 1]])) {
        return false;
      }
    }
    return true;
  }

  private keepGlobalKey(array) {
    if (array.filter(item => item.checkboxValue === true).length > 0) {
      return array.filter(item => item.checkboxValue === true).map(a => a.id);
    } else {
      return undefined;
    }
  }

}
