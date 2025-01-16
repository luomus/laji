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
import { UserService } from '../../shared/service/user.service';

const DATE_FORMAT = 'YYYY-MM-DD';

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
  conservation: Array<keyof WarehouseQueryInterface>;
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

  @Input() invasiveStatuses: (keyof ObservationFormQuery)[] = [];

  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();
  @Output() mapDraw = new EventEmitter<string>();

  formQuery!: ObservationFormQuery;

  showPlace = false;

  areaType = Area.AreaType;
  dataSource: Observable<any>;
  typeaheadLoading = false;
  autocompleteLimit = 10;
  logCoordinateAccuracyMax = 4;
  selectedNameTaxon: { id: string; value: string }[] = [];

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
      'onlyNonStateLands',
      'area',
      'coordinates',
      'coordinateAccuracyMax',
      'sourceOfCoordinates'
    ],
    sample: ['sampleType', 'sampleMaterial', 'sampleQuality', 'sampleStatus', 'sampleFact'],
    observer: ['teamMember', 'teamMemberId'],
    individual: ['sex', 'lifeStage', 'alive', 'recordBasis', 'wild', 'nativeOccurrence', 'breedingSite', 'atlasCode', 'atlasClass', 'plantStatusCode',
      'identificationBasis', 'samplingMethod', 'occurrenceCountFinlandMax', 'individualCountMin', 'individualCountMax'],
    quality: ['recordQuality', 'collectionAndRecordQuality', 'unidentified', 'needsCheck', 'annotated', 'qualityIssues', 'effectiveTag', 'collectionQuality'],
    dataset: ['collectionId', 'sourceId'],
    collection: ['collectionId', 'typeSpecimen'],
    conservation: ['administrativeStatusId', 'redListStatusId', 'taxonAdminFiltersOperator'],
    keywords: ['documentId', 'keyword'],
    features: ['administrativeStatusId', 'redListStatusId', 'typeOfOccurrenceId', 'typeOfOccurrenceIdNot', 'taxonRankId', 'higherTaxon',
      'invasive', 'finnish', 'sensitive'],
    invasive: [],
    image: ['hasUnitMedia', 'hasGatheringMedia', 'hasDocumentMedia', 'hasUnitImages', 'hasUnitAudio', 'hasUnitModel'],
    secure: ['secured', 'secureLevel'],
  };

  delayedSearch = new Subject();
  delayedSub: Subscription;
  screenWidthSub?: Subscription;
  containerTypeAhead?: string;
  collectionAndRecordQualityString?: string;
  isLoggedIn$ = this.userService.isLoggedIn$;

  private _query!: WarehouseQueryInterface;

  virFilterShortcutQueryParams = {
    // eslint-disable-next-line max-len
    administrativeStatusId: `MX.finlex160_1997_appendix4_2021,MX.finlex160_1997_appendix4_specialInterest_2021,MX.finlex160_1997_appendix2a,MX.finlex160_1997_appendix2b,MX.finlex160_1997_appendix3a,MX.finlex160_1997_appendix3b,MX.finlex160_1997_appendix3c,MX.finlex160_1997_largeBirdsOfPrey,MX.habitatsDirectiveAnnexII,MX.habitatsDirectiveAnnexIV,MX.birdsDirectiveStatusAppendix1,MX.birdsDirectiveStatusMigratoryBirds`,
    redListStatusId: 'MX.iucnCR,MX.iucnEN,MX.iucnVU,MX.iucnNT',
    countryId: 'ML.206',
    time: '1990-01-01%2F',
    // eslint-disable-next-line max-len
    collectionAndRecordQuality: 'PROFESSIONAL:EXPERT_VERIFIED,COMMUNITY_VERIFIED,NEUTRAL,UNCERTAIN;HOBBYIST:EXPERT_VERIFIED,COMMUNITY_VERIFIED,NEUTRAL;AMATEUR:EXPERT_VERIFIED,COMMUNITY_VERIFIED;',
    taxonAdminFiltersOperator: 'OR',
    individualCountMin: 0,
    coordinateAccuracyMax: 1000
  };

  birdAtlasFilterShortcutQueryParams = {
    informalTaxonGroupId: 'MVL.1',
    countryId: 'ML.206',
    time: '2022-01-01%2F2025-12-31',
    recordQuality: 'COMMUNITY_VERIFIED,NEUTRAL,EXPERT_VERIFIED',
    atlasClass: 'MY.atlasClassEnumB,MY.atlasClassEnumC,MY.atlasClassEnumD'
  };

  otsoFilterShortcutQueryParams = {
    administrativeStatusId: 'MX.finnishEnvironmentInstitute20192021forestSpecies',
    time: '1990-01-01%2F',
    onlyNonStateLands: true,
    coordinateAccuracyMax: 100,
    // eslint-disable-next-line max-len
    collectionAndRecordQuality: 'PROFESSIONAL:EXPERT_VERIFIED,COMMUNITY_VERIFIED,NEUTRAL;AMATEUR:EXPERT_VERIFIED,COMMUNITY_VERIFIED;HOBBYIST:COMMUNITY_VERIFIED,NEUTRAL,EXPERT_VERIFIED',
    countryId: 'ML.206'
  };

  constructor(
    private observationFacade: ObservationFacade,
    private taxonAutocompleteService: TaxonAutocompleteService,
    private browserService: BrowserService,
    private userService: UserService
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

  @Input({ required: true })
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

  togglePlace(event: any) {
    // IE triggers this event even when not given by the
    if (!event || !event.hasOwnProperty('value')) {
      return;
    }
    this.showPlace = !this.showPlace;
  }

  onOnlyFromCollectionCheckBoxToggle() {
    this.query.sourceId = this.formQuery.onlyFromCollectionSystems ? ['KE.3', 'KE.167'] : [];
    this.query.superRecordBasis = this.formQuery.onlyFromCollectionSystems ? ['PRESERVED_SPECIMEN'] : [];
    this.onQueryChange();
  }

  onInvasiveCheckBoxToggle(field: (keyof ObservationFormQuery)|(keyof ObservationFormQuery)[]) {
    if (Array.isArray(field)) {
      this.formQuery.allInvasiveSpecies = !this.formQuery.allInvasiveSpecies;
      field.map(status => { (this.formQuery as any)[status] = this.formQuery.allInvasiveSpecies; });
    } else {
      (this.formQuery as any)[field] = !this.formQuery[field];
      if (!this.formQuery[field] && this.formQuery.allInvasiveSpecies) {
        this.formQuery.allInvasiveSpecies = false;
      }
    }
    this.formQueryToSearchQuery(this.formQuery);
    this.administrativeStatusChange();
  }

  private administrativeStatusChange() {
    const admins = this.query.administrativeStatusId;
    let cnt = 0;
    this.invasiveStatuses.map(key => {
      const realKey = 'MX.' + key;
      (this.formQuery as any)[key] = admins && admins.indexOf(realKey) > -1;
      if (this.formQuery[key]) {
        cnt++;
      }
    });
    this.formQuery.allInvasiveSpecies = cnt === this.invasiveStatuses.length;
    this.onQueryChange();
  }

  onAdministrativeStatusChange(administrativeStatusIds: string[]) {
    this.query.administrativeStatusId = administrativeStatusIds;
    this.administrativeStatusChange();
  }

  onRedListStatusChange(redListStatusIds: string[]) {
    this.query.redListStatusId = redListStatusIds;
    this.onQueryChange();
  }

  onConservationOperatorChange(operator: 'AND' | 'OR') {
    this.query.taxonAdminFiltersOperator = operator === 'OR' ? 'OR' : undefined;
    this.onQueryChange();
  }

  onSystemIDChange() {
    this.formQuery.onlyFromCollectionSystems = this.query.sourceId?.length === 2
      && this.query.sourceId?.indexOf('KE.3') > -1
      && this.query.sourceId?.indexOf('KE.167') > -1;
    this.onQueryChange();
  }

  onCheckBoxToggle(field: keyof WarehouseQueryInterface, selectValue: any = true, isDirect = true) {
    if (isDirect) {
      this.query[field] = typeof this.query[field] === 'undefined' || this.query[field] !== selectValue ? selectValue : undefined;
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

  onSelectionIdChange(selections: {[key: string]: string[]}, target: 'query' | 'formQuery' = 'query') {
    if (target === 'query') {
      Object.keys(selections).forEach(key => {
        (this.query as any)[key] = selections[key];
      });

      this.onQueryChange();

    } else if (target === 'formQuery') {
      Object.keys(selections).forEach(key => {
        (this.formQuery as any)[key] = selections[key];
      });

      this.onFormQueryChange();
    }
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

  onAsObserverChange(value: boolean) {
    this.formQuery.asObserver = value;
    this.onFormQueryChange();
  }

  onAsEditorChange(value: boolean) {
    this.formQuery.asEditor = value;
    this.onFormQueryChange();
  }

  onAsNotEditorOrObserverChange(value: boolean) {
    this.formQuery.asNotEditorOrObserver = value;
    this.onFormQueryChange();
  }

  onAsEditorOrObserverChange(value: boolean) {
    this.formQuery.asObserver = value;
    this.formQuery.asEditor = value;
    this.onFormQueryChange();
  }

  onOwnQualityIssuesFilterChange(value: string) {
    this.query.qualityIssues = value;
    this.onQueryChange();
  }

  onFormQueryChange() {
    this.formQueryToSearchQuery(this.formQuery);
    this.onQueryChange();
  }

  onTaxonSelect(event: any) {
    if ((event.key === 'Enter' || (event.value && event.item)) && this.formQuery.taxon) {
      const target = event.item && event.item.key ? event.item.key : this.formQuery.taxon;
      this.query['target'] = this.query['target'] ? [...this.query['target'], target] : [target];
      this.selectedNameTaxon.push({id: event.item ? event.item.key : this.formQuery.taxon,
        value: event.item ? event.item.autocompleteSelectedName : this.formQuery.taxon});
      this.formQuery.taxon = '';
      this.onQueryChange();
    }
  }

  updateSearchQuery(field: keyof WarehouseQueryInterface, value: any) {
    this.query[field] = value;
    this.onQueryChange();
  }

  enableAccuracySlider() {
    if (!this.query.coordinateAccuracyMax) {
      this.query.coordinateAccuracyMax = 1000;
      this.onAccuracySliderInput();
    }
  }

  onAccuracySliderInput() {
    this.query.coordinateAccuracyMax = Math.pow(10, this.logCoordinateAccuracyMax);
    this.onQueryChange();
  }

  onAccuracyValueChange() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.logCoordinateAccuracyMax = Math.log10(this.query.coordinateAccuracyMax!);
    this.delayedQueryChange();
  }

  indirectQueryChange(field: keyof WarehouseQueryInterface, value: any) {
    this.query[field] = value;
    this.onQueryChange();
  }

  subCategoryChange(event: any) {
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

  updateTypeOfOccurrence(event: any) {
    this.query.typeOfOccurrenceId = event.true;
    this.query.typeOfOccurrenceIdNot = event.false;
    this.onQueryChange();
  }

  private updateVisibleSections() {
    this.updateVisible('sections', 'visible');
  }

  private updateVisible(sectionKey: 'sections', visibilityKey: 'visible'): void;
  private updateVisible(
    sectionKey: keyof Pick<this, 'sections'>,
    visibilityKey: keyof Pick<this, 'visible'>
  ) {
    Object.keys(this[sectionKey]).forEach(section => {
      let visible = false;
      for (const key of (this as any)[sectionKey][section]) {
        const value = this.query[key as keyof WarehouseQueryInterface];
        if ((Array.isArray(value) && value.length > 0) || typeof value !== 'undefined') {
          visible = true;
          break;
        }
      }
      (this as any)[visibilityKey][section] = visible;
    });
  }

  private hasInMulti(multi: any, value: any): boolean {
    if (Array.isArray(value)) {
      return value.filter(val => !this.hasInMulti(multi, val)).length === 0;
    }
    return Array.isArray(multi) && multi.indexOf(value) > -1;
  }

  private getValidDate(date: string|false) {
    if (date && (moment(date, DATE_FORMAT, true).isValid() || isRelativeDate(date))) {
      return date;
    }
    return '';
  }

  protected searchQueryToFormQuery(query: WarehouseQueryInterface): ObservationFormQuery {
    let timeStart: string, timeEnd: string|false;
    if (query.time && query.time[0] && isRelativeDate(query.time[0])) {
      timeStart = query.time[0];
      timeEnd = false;
    } else {
      const time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
      timeStart = time[0];
      timeEnd = time[1];
    }
    if (query.coordinateAccuracyMax) {
      this.logCoordinateAccuracyMax = Math.log10(query.coordinateAccuracyMax);
    }
    return {
      taxon: '',
      timeStart: this.getValidDate(timeStart),
      timeEnd: this.getValidDate(timeEnd),
      informalTaxonGroupId: query.informalTaxonGroupId ?
        query.informalTaxonGroupId : undefined,
      informalTaxonGroupIdNot: query.informalTaxonGroupIdNot ?
        query.informalTaxonGroupIdNot : undefined,
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
      onlyFromCollectionSystems: this.hasInMulti(query.sourceId, ['KE.167', 'KE.3'])
        && query.sourceId?.length === 2
        && this.hasInMulti(query.superRecordBasis, ['PRESERVED_SPECIMEN'])
        && query.superRecordBasis?.length === 1,
      asObserver: !!query.observerPersonToken || !!query.editorOrObserverPersonToken,
      asEditor: !!query.editorPersonToken || !!query.editorOrObserverPersonToken,
      asNotEditorOrObserver: !!query.editorOrObserverIsNotPersonToken,
      taxonIncludeLower: typeof query.includeSubTaxa !== 'undefined' ? query.includeSubTaxa : true,
      taxonUseAnnotated: typeof query.useIdentificationAnnotations !== 'undefined' ? query.useIdentificationAnnotations : true,
      coordinatesInSource: query.sourceOfCoordinates && query.sourceOfCoordinates.includes('REPORTED_VALUE'),
      taxonAdminFiltersOperator: query.taxonAdminFiltersOperator === 'OR' ? 'OR' : undefined
    };
  }

  protected formQueryToSearchQuery(formQuery: ObservationFormQuery) {
    // this.query is the same object reference from ObservationFacade!!
    // mutating it outside of ObservationFacade causes unpredictable behavior with person tokens
    // because personToken is 'true' in formQuery, but replaced by person token in ObservationFacade
    // therefore we are creating a shallow copy on the next line
    const query = {...this.query};
    //const query = this.query;

    if (isRelativeDate(formQuery.timeStart) && !formQuery.timeEnd) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      query.time = [formQuery.timeStart!];
    } else {
      const time = this.parseDate(formQuery.timeStart, formQuery.timeEnd);
      query.time = time.length > 0 ? [time] : undefined;
    }

    query.informalTaxonGroupId = formQuery.informalTaxonGroupId ? formQuery.informalTaxonGroupId : undefined;
    query.informalTaxonGroupIdNot = formQuery.informalTaxonGroupIdNot ? formQuery.informalTaxonGroupIdNot : undefined;
    query.includeNonValidTaxa = formQuery.includeOnlyValid ? false : query.includeNonValidTaxa;
    if (formQuery.allInvasiveSpecies) {
      query.administrativeStatusId = this.invasiveStatuses.map(val => 'MX.' + val);
    }
    if (formQuery.onlyFromCollectionSystems) {
      query.sourceId = ['KE.167', 'KE.3'];
      query.superRecordBasis = ['PRESERVED_SPECIMEN'];
    }
    query.editorPersonToken = formQuery.asEditor ? ObservationFacade.PERSON_TOKEN : undefined;
    query.observerPersonToken = formQuery.asObserver ? ObservationFacade.PERSON_TOKEN : undefined;
    query.editorOrObserverIsNotPersonToken = formQuery.asNotEditorOrObserver ? ObservationFacade.PERSON_TOKEN : undefined;
    query.includeSubTaxa = formQuery.taxonIncludeLower ? undefined : false;
    query.useIdentificationAnnotations = formQuery.taxonUseAnnotated ? undefined : false;
    query.sourceOfCoordinates = formQuery.coordinatesInSource ? ['REPORTED_VALUE'] : undefined;
    query.taxonAdminFiltersOperator = formQuery.taxonAdminFiltersOperator === 'OR' ? 'OR' : undefined;
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

    this.query = query;
  }

  private parseDate(start?: string, end?: string) {
    if (!start && !end) {
      return '';
    }
    if (
      (start && !moment(start, DATE_FORMAT, true).isValid()) ||
      (end && !moment(end, DATE_FORMAT, true).isValid())
    ) {
      return '';
    }
    return (start || '') + '/' + (end || '');
  }

  updateTime(dates: number, startTarget?: 'time'): void;
  updateTime(dates: number, startTarget: keyof WarehouseTimeQueryInterface, endTarget: keyof WarehouseTimeQueryInterface ): void;
  updateTime(dates: number, startTarget: 'time' | keyof WarehouseTimeQueryInterface = 'time', endTarget?: keyof WarehouseTimeQueryInterface ) {
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.query[endTarget!] = undefined;
      this.onQueryChange();
    }
  }

  private checkSubcategoriesExceptGlobalAreEquals(selected: Record<string, any>, categories: string[]) {
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

  private keepGlobalKey(array: any[]) {
    if (array.filter(item => item.checkboxValue === true).length > 0) {
      return array.filter(item => item.checkboxValue === true).map(a => a.id);
    } else {
      return undefined;
    }
  }

}
