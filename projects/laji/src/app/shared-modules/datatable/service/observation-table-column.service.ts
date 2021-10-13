import { Injectable } from '@angular/core';
import { IColumnGroup, IGenericColumn, TableColumnService } from './table-column.service';
import { ObservationTableColumn } from '../../observation-result/model/observation-table-column';
import { environment } from '../../../../environments/environment';
import { Global } from '../../../../environments/global';

export interface IColumns extends IGenericColumn<ObservationTableColumn> {
  'document.documentId': ObservationTableColumn;
  'unit.unitId': ObservationTableColumn;
  'unit.taxon': ObservationTableColumn;
  'unit.taxonVerbatim': ObservationTableColumn;
  'unit.linkings.taxon.vernacularName': ObservationTableColumn;
  'unit.linkings.taxon.scientificName': ObservationTableColumn;
  'unit.linkings.taxon.taxonomicOrder': ObservationTableColumn;
  'unit.linkings.taxon.latestRedListStatusFinland': ObservationTableColumn;
  'unit.species': ObservationTableColumn;
  'unit.linkings.species.vernacularName': ObservationTableColumn;
  'unit.linkings.species.scientificName': ObservationTableColumn;
  'unit.linkings.species.taxonomicOrder': ObservationTableColumn;
  'unit.reportedTaxonConfidence': ObservationTableColumn;
  'unit.interpretations.recordQuality': ObservationTableColumn;
  'unit.linkings.taxon.sensitive': ObservationTableColumn;
  'gathering.team': ObservationTableColumn;
  'gathering.interpretations.countryDisplayname': ObservationTableColumn;
  'gathering.interpretations.biogeographicalProvinceDisplayname': ObservationTableColumn;
  'gathering.interpretations.municipalityDisplayname': ObservationTableColumn;
  'gathering.team.memberName': ObservationTableColumn;
  'gathering.locality': ObservationTableColumn;
  'gathering.displayDateTime': ObservationTableColumn;
  'gathering.interpretations.coordinateAccuracy': ObservationTableColumn;
  'unit.abundanceUnit': ObservationTableColumn;
  'unit.abundanceString': ObservationTableColumn;
  'unit.interpretations.individualCount': ObservationTableColumn;
  'unit.lifeStage': ObservationTableColumn;
  'unit.sex': ObservationTableColumn;
  'unit.recordBasis': ObservationTableColumn;
  'unit.media.mediaType': ObservationTableColumn;
  'document.collectionId': ObservationTableColumn;
  'unit.notes': ObservationTableColumn;
  'gathering.notes': ObservationTableColumn;
  'unit.facts.fact': ObservationTableColumn;
  'unit.facts.value': ObservationTableColumn;
  'document.secureLevel': ObservationTableColumn;
  'document.secureReasons': ObservationTableColumn;
  'document.sourceId': ObservationTableColumn;
  'document.linkings.collectionQuality': ObservationTableColumn;
  'document.createdDate': ObservationTableColumn;
  'document.modifiedDate': ObservationTableColumn;
  'document.dateEdited': ObservationTableColumn;
  'document.dateObserved': ObservationTableColumn;
  'document.namedPlaceId': ObservationTableColumn;
  'document.formId': ObservationTableColumn;
  'document.keywords': ObservationTableColumn;
  'unit.det': ObservationTableColumn;
  'gathering.conversions.dayOfYearBegin': ObservationTableColumn;
  'gathering.conversions.dayOfYearEnd': ObservationTableColumn;
  'unit.superRecordBasis': ObservationTableColumn;
  'oldestRecord': ObservationTableColumn;
  'newestRecord': ObservationTableColumn;
  'count': ObservationTableColumn;
  'individualCountMax': ObservationTableColumn;
  'individualCountSum': ObservationTableColumn;
  'pairCountSum': ObservationTableColumn;
  'gathering.coordinatesVerbatim': ObservationTableColumn;
  'gathering.conversions.ykj': ObservationTableColumn;
  'gathering.conversions.ykj.latMin': ObservationTableColumn;
  'gathering.conversions.ykj.latMax': ObservationTableColumn;
  'gathering.conversions.ykj.lonMin': ObservationTableColumn;
  'gathering.conversions.ykj.lonMax': ObservationTableColumn;
  'gathering.conversions.ykj10km': ObservationTableColumn;
  'gathering.conversions.ykj10kmCenter': ObservationTableColumn;
  'gathering.conversions.ykj1km': ObservationTableColumn;
  'gathering.conversions.ykj1kmCenter': ObservationTableColumn;
  'gathering.conversions.euref': ObservationTableColumn;
  'gathering.conversions.euref.latMin': ObservationTableColumn;
  'gathering.conversions.euref.latMax': ObservationTableColumn;
  'gathering.conversions.euref.lonMin': ObservationTableColumn;
  'gathering.conversions.euref.lonMax': ObservationTableColumn;
  'gathering.conversions.eurefCenterPoint.lat': ObservationTableColumn;
  'gathering.conversions.eurefCenterPoint.lon': ObservationTableColumn;
  'gathering.conversions.wgs84': ObservationTableColumn;
  'gathering.conversions.wgs84.latMin': ObservationTableColumn;
  'gathering.conversions.wgs84.latMax': ObservationTableColumn;
  'gathering.conversions.wgs84.lonMin': ObservationTableColumn;
  'gathering.conversions.wgs84.lonMax': ObservationTableColumn;
  'gathering.conversions.wgs84CenterPoint.lat': ObservationTableColumn;
  'gathering.conversions.wgs84CenterPoint.lon': ObservationTableColumn;
  'gathering.interpretations.country': ObservationTableColumn;
  'sample.sampleId': ObservationTableColumn;
  'sample.type': ObservationTableColumn;
  'sample.material': ObservationTableColumn;
  'sample.quality': ObservationTableColumn;
  'sample.status': ObservationTableColumn;
  'sample.notes': ObservationTableColumn;
  'sample.collectionId': ObservationTableColumn;
  'document.facts.legID': ObservationTableColumn;
  'document.facts.mappingReason': ObservationTableColumn;
  'document.facts.speciesTrackingStatus': ObservationTableColumn;
  'document.facts.targetState': ObservationTableColumn;
  'document.facts.sourceMaterial': ObservationTableColumn;
  'document.facts.sourceDescription': ObservationTableColumn;
  'sample.facts.preparationMaterials': ObservationTableColumn;
  'sample.facts.elutionMedium': ObservationTableColumn;
  'sample.facts.additionalIDs': ObservationTableColumn;
  'sample.facts.qualityCheckMethod': ObservationTableColumn;
  'sample.facts.DNAVolumeMicroliters': ObservationTableColumn;
  'sample.facts.DNARatioOfAbsorbance260And280': ObservationTableColumn;
  'sample.facts.DNAConcentrationNgPerMicroliter': ObservationTableColumn;
}

export const COLUMNS: IColumns = {
  'unit.taxon': {
    name: 'unit.taxon',
    prop: 'unit',
    target: '_blank',
    label: 'result.unit.taxonVerbatim',
    cellTemplate: 'taxon',
    sortBy: 'unit.linkings.taxon.name%longLang%,unit.linkings.taxon.scientificName,unit.taxonVerbatim,unit.reportedInformalTaxonGroup',
    selectField: 'unit',
    aggregateBy: 'unit.linkings.taxon.id,' +
      'unit.linkings.taxon.nameFinnish,' +
      'unit.linkings.taxon.nameEnglish,' +
      'unit.linkings.taxon.nameSwedish,' +
      'unit.linkings.taxon.scientificName' +
      'unit.linkings.taxon.cursiveName',
    width: 300,
    required: environment.type === Global.type.vir
  },
  'unit.taxonVerbatim': {
    name: 'unit.taxonVerbatim',
    prop: 'unit.taxonVerbatim',
    label: 'taxonVerbatim'
  },
  'unit.linkings.taxon.vernacularName': {
    name: 'unit.linkings.taxon.vernacularName',
    cellTemplate: 'multiLang',
    sortBy: 'unit.linkings.taxon.name%longLang%',
    label: 'taxonomy.vernacular.name',
    aggregateBy: 'unit.linkings.taxon.id,' +
      'unit.linkings.taxon.nameFinnish,' +
      'unit.linkings.taxon.nameEnglish,' +
      'unit.linkings.taxon.nameSwedish'
  },
  'unit.linkings.taxon.scientificName': {
    name: 'unit.linkings.taxon.scientificName',
    prop: 'unit.linkings.taxon',
    cellTemplate: 'scientificName',
    label: 'result.scientificName',
    selectField: 'unit.linkings.taxon.scientificName,unit.linkings.taxon.cursiveName',
    sortBy: 'unit.linkings.taxon.scientificName',
    aggregateBy: 'unit.linkings.taxon.id,unit.linkings.taxon.scientificName,unit.linkings.taxon.cursiveName'
  },
  'unit.linkings.taxon.taxonomicOrder': {
    name: 'unit.linkings.taxon.taxonomicOrder',
    label: 'result.taxonomicOrder',
    aggregateBy: 'unit.linkings.taxon.id,unit.linkings.taxon.taxonomicOrder',
    width: 70
  },
  'unit.linkings.taxon.latestRedListStatusFinland': {
    name: 'unit.linkings.taxon.latestRedListStatusFinland',
    label: 'taxonomy.latestRedListStatusFinland',
    aggregateBy: 'unit.linkings.taxon.latestRedListStatusFinland.status',
    cellTemplate: 'iucnStatus',
    // sortBy: 'unit.linkings.taxon.latestRedListStatusFinland.status',
    cellClass: 'cell-centered-content',
    sortable: false,
    width: 140
  },
  'unit.species': {
    name: 'unit.species',
    prop: 'unit',
    target: '_blank',
    label: 'result.unit.taxonVerbatim',
    cellTemplate: 'species',
    sortBy: 'unit.linkings.taxon.speciesName%longLang%',
    selectField: 'unit',
    aggregateBy: 'unit.linkings.taxon.speciesId,' +
      'unit.linkings.taxon.speciesNameFinnish,' +
      'unit.linkings.taxon.speciesNameEnglish,' +
      'unit.linkings.taxon.speciesNameSwedish,' +
      'unit.linkings.taxon.speciesScientificName',
    width: 300
  },
  'unit.linkings.species.vernacularName': {
    name: 'unit.linkings.species.vernacularName',
    prop: 'unit.linkings.taxon.speciesVernacularName',
    cellTemplate: 'multiLang',
    sortBy: 'unit.linkings.taxon.speciesName%longLang%',
    label: 'taxonomy.vernacular.name',
    aggregateBy: 'unit.linkings.taxon.speciesId,' +
      'unit.linkings.taxon.speciesNameFinnish,' +
      'unit.linkings.taxon.speciesNameEnglish,' +
      'unit.linkings.taxon.speciesNameSwedish'
  },
  'unit.linkings.species.scientificName': {
    name: 'unit.linkings.species.scientificName',
    prop: 'unit.linkings.taxon.speciesScientificName',
    label: 'result.scientificName',
    cellTemplate: 'cursive',
    sortBy: 'unit.linkings.taxon.speciesScientificName',
    aggregateBy: 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName'
  },
  'unit.linkings.species.taxonomicOrder': {
    name: 'unit.linkings.species.taxonomicOrder',
    prop: 'unit.linkings.taxon.speciesTaxonomicOrder',
    label: 'result.taxonomicOrder',
    aggregateBy: 'unit.linkings.taxon.species,unit.linkings.taxon.speciesTaxonomicOrder',
    width: 70
  },
  'unit.linkings.taxon.sensitive': {
    name: 'unit.linkings.taxon.sensitive',
    cellTemplate: 'sensitiveIcon',
    cellClass: 'cell-centered-content',
    label: 'result.unit.sensitive'
  },
  'unit.reportedTaxonConfidence': {name: 'unit.reportedTaxonConfidence', cellTemplate: 'warehouseLabel'},
  'unit.interpretations.recordQuality': {
    name: 'unit.interpretations.recordQuality',
    cellTemplate: 'qualityIcon',
    label: 'result.unit.quality.taxon',
    sortable: true,
    sortBy: 'unit.interpretations.recordQualityNumeric',
    width: 50,
  },
  'gathering.team': {name: 'gathering.team', cellTemplate: 'toSemicolon', required: environment.type === Global.type.vir},
  'gathering.interpretations.countryDisplayname': {
    name: 'gathering.interpretations.countryDisplayname',
    label: 'result.gathering.country',
    required: true,
    sortable: false
  },
  'gathering.interpretations.biogeographicalProvinceDisplayname': {
    name: 'gathering.interpretations.biogeographicalProvinceDisplayname',
    label: 'result.gathering.biogeographicalProvince',
    aggregateBy: 'gathering.interpretations.biogeographicalProvince,gathering.interpretations.biogeographicalProvinceDisplayname'
  },
  'gathering.interpretations.municipalityDisplayname': {
    name: 'gathering.interpretations.municipalityDisplayname',
    label: 'observation.form.municipality',
    aggregateBy: 'gathering.interpretations.finnishMunicipality,gathering.interpretations.municipalityDisplayname',
    required: environment.type === Global.type.vir
  },
  'gathering.team.memberName': {
    name: 'gathering.team.memberName',
    label: 'observation.form.team',
    aggregateBy: 'gathering.team.memberId,gathering.team.memberName'
  },
  'gathering.locality': {name: 'gathering.locality'},
  'gathering.displayDateTime': {name: 'gathering.displayDateTime', required: environment.type === Global.type.vir},
  'gathering.interpretations.coordinateAccuracy': {
    name: 'gathering.interpretations.coordinateAccuracy',
    cellTemplate: 'numeric'
  },
  'unit.abundanceString': {
    name: 'unit.abundanceString',
    cellTemplate: 'numeric',
    sortBy: 'unit.interpretations.individualCount,unit.abundanceString'
  },
  'unit.interpretations.individualCount': {name: 'unit.interpretations.individualCount', cellTemplate: 'numeric'},
  'unit.lifeStage': {name: 'unit.lifeStage', cellTemplate: 'warehouseLabel', label: 'observation.form.lifeStage'},
  'unit.sex': {name: 'unit.sex', cellTemplate: 'warehouseLabel', label: 'observation.form.sex'},
  'unit.recordBasis': {
    name: 'unit.recordBasis',
    cellTemplate: 'warehouseLabel',
    label: 'observation.filterBy.recordBasis'
  },
  'unit.media.mediaType': {
    name: 'unit.media.mediaType',
    cellTemplate: 'warehouseLabel',
    label: 'observation.filterBy.image'
  },
  'document.collectionId': {name: 'document.collectionId', cellTemplate: 'label', width: 300, sortable: false, required: true},
  'unit.notes': {name: 'unit.notes', sortable: false, label: 'result.unit.notes'},
  'gathering.notes': {name: 'gathering.notes', sortable: false, label: 'result.gathering.notes'},
  'document.documentId': {name: 'document.documentId', required: environment.type === Global.type.vir},
  'unit.unitId': {name: 'unit.unitId'},
  'unit.abundanceUnit': {name: 'unit.abundanceUnit', sortable: false, label: 'result.gathering.abundanceUnit', cellTemplate: 'warehouseLabel'},
  'document.secureLevel': {name: 'document.secureLevel', cellTemplate: 'warehouseLabel'},
  'document.secureReasons': {name: 'document.secureReasons', sortable: false, cellTemplate: 'warehouseLabel'},
  'document.sourceId': {name: 'document.sourceId', cellTemplate: 'label', sortable: false},
  'document.linkings.collectionQuality': {
    name: 'document.linkings.collectionQuality',
    cellTemplate: 'qualityIcon',
    sortable: false,
    width: 50
  },
  'document.createdDate': {name: 'document.createdDate', label: 'haseka.submissions.dateObserved', cellTemplate: 'date', sortable: false},
  'document.modifiedDate': {name: 'document.modifiedDate', label: 'haseka.submissions.dateEdited', cellTemplate: 'date', sortable: false},
  'document.dateObserved': {name: 'document.dateObserved', label: 'haseka.submissions.dateObserved', cellTemplate: 'date', sortable: false},
  'document.dateEdited': {name: 'document.dateEdited', label: 'haseka.submissions.dateEdited', cellTemplate: 'date', sortable: false},
  'document.namedPlaceId': {name: 'document.namedPlaceId', label: 'haseka.submissions.locality', cellTemplate: 'country', sortable: false},
  'document.formId': {name: 'document.formId', label: 'haseka.submissions.form', cellTemplate: 'formName', sortable: false},
  'document.keywords': {name: 'document.keywords', label: 'observation.active.keyword', cellTemplate: 'label', sortable: false},
  'unit.det': {name: 'unit.det'},
  'gathering.conversions.dayOfYearBegin': {name: 'gathering.conversions.dayOfYearBegin'},
  'gathering.conversions.dayOfYearEnd': {name: 'gathering.conversions.dayOfYearEnd'},
  'unit.superRecordBasis': {
    name: 'unit.superRecordBasis',
    cellTemplate: 'warehouseLabel',
    label: 'observation.active.superRecordBasis'
  },
  'unit.facts.fact': {
    name: 'unit.facts.fact',
    prop: 'unit.facts.fact',
    cellTemplate: 'label'
  },
  'unit.facts.value': {
    name: 'unit.facts.value',
    prop: 'unit.facts.value'
  },
  'oldestRecord': {name: 'oldestRecord', width: 85},
  'newestRecord': {name: 'newestRecord', width: 85},
  'count': {name: 'count', draggable: false, label: 'theme.countShort', width: 75, cellTemplate: 'numeric'},
  'individualCountMax': {
    name: 'individualCountMax',
    label: 'theme.individualCountMax',
    width: 80,
    cellTemplate: 'numeric'
  },
  'individualCountSum': {
    name: 'individualCountSum',
    label: 'theme.individualCount',
    width: 80,
    cellTemplate: 'numeric'
  },
  'pairCountSum': {
    name: 'pairCountSum',
    label: 'theme.pairCount',
    width: 75,
    cellTemplate: 'numeric',
    aggregate: false
  },
  'gathering.coordinatesVerbatim': {
    name: 'gathering.coordinatesVerbatim',
  },
  'gathering.conversions.ykj': {
    name: 'gathering.conversions.ykj',
    prop: 'gathering.conversions.ykj.verbatim',
    sortable: false
  },
  'gathering.conversions.ykj.latMin': {
    name: 'gathering.conversions.ykj.latMin',
    sortable: false
  },
  'gathering.conversions.ykj.latMax': {
    name: 'gathering.conversions.ykj.latMax',
    sortable: false
  },
  'gathering.conversions.ykj.lonMin': {
    name: 'gathering.conversions.ykj.lonMin',
    sortable: false
  },
  'gathering.conversions.ykj.lonMax': {
    name: 'gathering.conversions.ykj.lonMax',
    sortable: false
  },
  'gathering.conversions.ykj10km': {
    name: 'gathering.conversions.ykj10km',
    prop: 'gathering.conversions.ykj10km.verbatim',
    sortable: false
  },
  'gathering.conversions.ykj10kmCenter': {
    name: 'gathering.conversions.ykj10kmCenter',
    prop: 'gathering.conversions.ykj10kmCenter.verbatim',
    sortable: false
  },
  'gathering.conversions.ykj1km': {
    name: 'gathering.conversions.ykj1km',
    prop: 'gathering.conversions.ykj1km.verbatim',
    sortable: false
  },
  'gathering.conversions.ykj1kmCenter': {
    name: 'gathering.conversions.ykj1kmCenter',
    prop: 'gathering.conversions.ykj1kmCenter.verbatim',
    sortable: false
  },
  'gathering.conversions.euref': {
    name: 'gathering.conversions.euref',
    prop: 'gathering.conversions.euref.verbatim',
    sortable: false,
    required: environment.type === Global.type.vir
  },
  'gathering.conversions.euref.latMin': {
    name: 'gathering.conversions.euref.latMin',
    sortable: false
  },
  'gathering.conversions.euref.latMax': {
    name: 'gathering.conversions.euref.latMax',
    sortable: false
  },
  'gathering.conversions.euref.lonMin': {
    name: 'gathering.conversions.euref.lonMin',
    sortable: false
  },
  'gathering.conversions.euref.lonMax': {
    name: 'gathering.conversions.euref.lonMax',
    sortable: false
  },
  'gathering.conversions.eurefCenterPoint': {
    name: 'gathering.conversions.eurefCenterPoint',
    label: 'result.gathering.conversions.euref',
    sortable: false
  },
  'gathering.conversions.eurefCenterPoint.lat': {
    name: 'gathering.conversions.eurefCenterPoint.lat',
    sortable: false
  },
  'gathering.conversions.eurefCenterPoint.lon': {
    name: 'gathering.conversions.eurefCenterPoint.lon',
    sortable: false
  },
  'gathering.conversions.wgs84': {
    name: 'gathering.conversions.wgs84',
    prop: 'gathering.conversions.wgs84.verbatim',
    sortable: false,
  },
  'gathering.conversions.wgs84.latMin': {
    name: 'gathering.conversions.wgs84.latMin',
    sortable: false
  },
  'gathering.conversions.wgs84.latMax': {
    name: 'gathering.conversions.wgs84.latMax',
    sortable: false
  },
  'gathering.conversions.wgs84.lonMin': {
    name: 'gathering.conversions.wgs84.lonMin',
    sortable: false
  },
  'gathering.conversions.wgs84.lonMax': {
    name: 'gathering.conversions.wgs84.lonMax',
    sortable: false
  },
  'gathering.conversions.wgs84CenterPoint': {
    name: 'gathering.conversions.wgs84CenterPoint',
    label: 'result.gathering.conversions.wgs84',
    sortable: false
  },
  'gathering.conversions.wgs84CenterPoint.lat': {
    name: 'gathering.conversions.wgs84CenterPoint.lat',
    sortable: false
  },
  'gathering.conversions.wgs84CenterPoint.lon': {
    name: 'gathering.conversions.wgs84CenterPoint.lon',
    sortable: false
  },
  'gathering.conversions.wgs84WKT': {
    name: 'gathering.conversions.wgs84WKT',
    sortable: false
  },
  'gathering.interpretations.country': {
    cellTemplate: 'label',
    label: 'result.gathering.country'
  },
  'sample.sampleId': {name: 'sample.sampleId', width: 300, sortable: false},
  'sample.type': {name: 'sample.type', transform: 'label', sortable: false},
  'sample.material': {name: 'sample.material', transform: 'label', sortable: false},
  'sample.quality': {name: 'sample.quality', transform: 'label', sortable: false},
  'sample.status': {name: 'sample.status', transform: 'label', sortable: false},
  'sample.notes': {name: 'sample.notes', sortable: false, label: 'result.document.notes'},
  'sample.collectionId': {
    name: 'sample.collectionId',
    cellTemplate: 'label',
    sortable: false,
    label: 'result.document.collectionId'
  },
  'document.facts.legID': {name: 'document.facts.legID', sortable: false, fact: 'http://tun.fi/MY.legID'},
  'document.facts.mappingReason': {name: 'document.facts.mappingReason', sortable: false, fact: 'Kartoituksen tarkoitus'},
  'document.facts.speciesTrackingStatus': {name: 'document.facts.speciesTrackingStatus', sortable: false, fact: 'Lajinseurantakohteen tila'},
  'document.facts.targetState': {name: 'document.facts.targetState', sortable: false, fact: 'Kohteen taso'},
  'document.facts.sourceMaterial': {name: 'document.facts.sourceMaterial', sortable: false, fact: 'Aineistolähde'},
  'document.facts.sourceDescription': {name: 'document.facts.sourceDescription', sortable: false, fact: 'Tietolähteen kuvaus'},
  'sample.facts.preparationMaterials': {
    name: 'sample.facts.preparationMaterials',
    transform: 'label',
    sortable: false,
    fact: 'http://tun.fi/MF.preparationMaterials'
  },
  'sample.facts.elutionMedium': {
    name: 'sample.facts.elutionMedium',
    transform: 'label',
    sortable: false,
    fact: 'http://tun.fi/MF.elutionMedium'
  },
  'sample.facts.additionalIDs': {name: 'sample.facts.additionalIDs', sortable: false, fact: 'http://tun.fi/MF.additionalIDs'},
  'sample.facts.qualityCheckMethod': {
    name: 'sample.facts.qualityCheckMethod',
    transform: 'label',
    sortable: false,
    fact: 'http://tun.fi/MF.qualityCheckMethod'
  },
  'sample.facts.DNAVolumeMicroliters': {
    name: 'sample.facts.DNAVolumeMicroliters',
    sortable: false,
    fact: 'http://tun.fi/MY.DNAVolumeMicroliters'
  },
  'sample.facts.DNARatioOfAbsorbance260And280': {
    name: 'sample.facts.DNARatioOfAbsorbance260And280',
    sortable: false,
    fact: 'http://tun.fi/MY.DNARatioOfAbsorbance260And280'
  },
  'sample.facts.DNAConcentrationNgPerMicroliter': {
    name: 'sample.facts.DNAConcentrationNgPerMicroliter',
    sortable: false,
    fact: 'http://tun.fi/MY.DNAConcentrationNgPerMicroliter'
  },
};

const lajiGISSectionHeader = 'lajiGIS.fields';

@Injectable()
export class ObservationTableColumnService extends TableColumnService<ObservationTableColumn, IColumns> {

  protected defaultFields: Array<keyof IColumns> = [
    'unit.interpretations.recordQuality',
    'document.linkings.collectionQuality',
    'unit.linkings.taxon.taxonomicOrder',
    'unit.taxon',
    'unit.abundanceString',
    'gathering.displayDateTime',
    'gathering.interpretations.country',
    'gathering.interpretations.countryDisplayname',
    'gathering.interpretations.biogeographicalProvinceDisplayname',
    'gathering.locality',
    'document.collectionId',
    'document.documentId',
    'gathering.team',
  ];

  protected allColumns: ObservationTableColumn[] = [
    COLUMNS['document.documentId'],
    COLUMNS['unit.unitId'],
    COLUMNS['unit.taxon'],
    COLUMNS['unit.taxonVerbatim'],
    COLUMNS['unit.linkings.taxon.vernacularName'],
    COLUMNS['unit.linkings.taxon.scientificName'],
    COLUMNS['unit.linkings.taxon.taxonomicOrder'],
    COLUMNS['unit.linkings.taxon.latestRedListStatusFinland'],
    COLUMNS['unit.species'],
    COLUMNS['unit.linkings.species.vernacularName'],
    COLUMNS['unit.linkings.species.scientificName'],
    COLUMNS['unit.linkings.species.taxonomicOrder'],
    COLUMNS['unit.linkings.taxon.sensitive'],
    COLUMNS['unit.reportedTaxonConfidence'],
    COLUMNS['unit.interpretations.recordQuality'],
    COLUMNS['gathering.team'],
    COLUMNS['gathering.interpretations.countryDisplayname'],
    COLUMNS['gathering.interpretations.biogeographicalProvinceDisplayname'],
    COLUMNS['gathering.interpretations.municipalityDisplayname'],
    COLUMNS['gathering.team.memberName'],
    COLUMNS['gathering.locality'],
    COLUMNS['gathering.displayDateTime'],
    COLUMNS['gathering.interpretations.coordinateAccuracy'],
    COLUMNS['gathering.conversions.ykj10kmCenter'],
    COLUMNS['unit.abundanceString'],
    COLUMNS['unit.abundanceUnit'],
    COLUMNS['unit.interpretations.individualCount'],
    COLUMNS['unit.lifeStage'],
    COLUMNS['unit.sex'],
    COLUMNS['unit.recordBasis'],
    COLUMNS['unit.media.mediaType'],
    COLUMNS['document.collectionId'],
    COLUMNS['unit.notes'],
    COLUMNS['gathering.notes'],
    COLUMNS['document.secureLevel'],
    COLUMNS['document.secureReasons'],
    COLUMNS['document.sourceId'],
    COLUMNS['document.linkings.collectionQuality'],
    COLUMNS['document.createdDate'],
    COLUMNS['document.modifiedDate'],
    COLUMNS['document.dateEdited'],
    COLUMNS['document.dateObserved'],
    COLUMNS['document.namedPlaceId'],
    COLUMNS['document.facts.mappingReason'],
    COLUMNS['document.facts.speciesTrackingStatus'],
    COLUMNS['document.facts.targetState'],
    COLUMNS['document.facts.sourceMaterial'],
    COLUMNS['document.facts.sourceDescription'],
    COLUMNS['document.formId'],
    COLUMNS['document.keywords'],
    COLUMNS['unit.det'],
    COLUMNS['unit.facts.fact'],
    COLUMNS['unit.facts.value'],
    COLUMNS['gathering.conversions.dayOfYearBegin'],
    COLUMNS['gathering.conversions.dayOfYearEnd'],
    COLUMNS['unit.superRecordBasis'],
    COLUMNS['oldestRecord'],
    COLUMNS['newestRecord'],
    COLUMNS['count'],
    COLUMNS['individualCountMax'],
    COLUMNS['individualCountSum'],
    COLUMNS['pairCountSum'],
    COLUMNS['gathering.coordinatesVerbatim'],
    COLUMNS['gathering.conversions.ykj'],
    COLUMNS['gathering.conversions.ykj.latMin'],
    COLUMNS['gathering.conversions.ykj.latMax'],
    COLUMNS['gathering.conversions.ykj.lonMin'],
    COLUMNS['gathering.conversions.ykj.lonMax'],
    COLUMNS['gathering.conversions.ykj10km'],
    COLUMNS['gathering.conversions.ykj10kmCenter'],
    COLUMNS['gathering.conversions.ykj1km'],
    COLUMNS['gathering.conversions.ykj1kmCenter'],
    COLUMNS['gathering.conversions.euref'],
    COLUMNS['gathering.conversions.euref.latMin'],
    COLUMNS['gathering.conversions.euref.latMax'],
    COLUMNS['gathering.conversions.euref.lonMin'],
    COLUMNS['gathering.conversions.euref.lonMax'],
    COLUMNS['gathering.conversions.eurefCenterPoint'],
    COLUMNS['gathering.conversions.eurefCenterPoint.lat'],
    COLUMNS['gathering.conversions.eurefCenterPoint.lon'],
    COLUMNS['gathering.conversions.wgs84'],
    COLUMNS['gathering.conversions.wgs84.latMin'],
    COLUMNS['gathering.conversions.wgs84.latMax'],
    COLUMNS['gathering.conversions.wgs84.lonMin'],
    COLUMNS['gathering.conversions.wgs84.lonMax'],
    COLUMNS['gathering.conversions.wgs84CenterPoint'],
    COLUMNS['gathering.conversions.wgs84CenterPoint.lat'],
    COLUMNS['gathering.conversions.wgs84CenterPoint.lon'],
    COLUMNS['gathering.conversions.wgs84WKT'],
    COLUMNS['gathering.interpretations.coordinateAccuracy'],
  ];

  protected columnGroups: IColumnGroup<IColumns>[][] = [
    [
      {
        header: 'identification', fields: [
          'unit.linkings.taxon.taxonomicOrder',
          'unit.taxon',
          'unit.linkings.taxon.vernacularName',
          'unit.linkings.taxon.scientificName',
          'unit.taxonVerbatim',
          'unit.linkings.taxon.latestRedListStatusFinland',
          'unit.linkings.taxon.sensitive'
        ]
      },
      {
        header: 'observation.form.date', fields: [
          'gathering.displayDateTime',
          'gathering.conversions.dayOfYearBegin',
          'gathering.conversions.dayOfYearEnd'
        ]
      },
      {
        header: 'persons', fields: [
          'gathering.team',
          'unit.det'
        ]
      },
      {
        header: 'observation.form.unit', fields: [
          'unit.abundanceString',
          'unit.abundanceUnit',
          'unit.interpretations.individualCount',
          'unit.lifeStage',
          'unit.sex'
        ]
      },
    ],
    [
      {
        header: 'observation.form.place', fields: [
          'gathering.locality',
          'gathering.interpretations.municipalityDisplayname',
          'gathering.interpretations.biogeographicalProvinceDisplayname',
          'gathering.interpretations.countryDisplayname'
        ]
      },
      {
        header: 'coordinates.center', fields: [
          'gathering.conversions.wgs84CenterPoint',
          'gathering.conversions.eurefCenterPoint',
          'gathering.interpretations.coordinateAccuracy'
        ]
      },
      {
        header: 'coordinates.boundingBox', fields: [
          'gathering.conversions.wgs84',
          'gathering.conversions.euref',
          'gathering.conversions.ykj'
        ]
      },
      {
        header: 'coordinates.geometryWKT', fields: [
          'gathering.conversions.wgs84WKT',
          'gathering.coordinatesVerbatim'
        ]
      },
      {
        header: 'coordinates.ykjGrids', fields: [
          'gathering.conversions.ykj10kmCenter',
          'gathering.conversions.ykj10km',
          'gathering.conversions.ykj1kmCenter',
          'gathering.conversions.ykj1km',
        ]
      },
    ],
    [
      {
        header: 'reliability', fields: [
          'unit.reportedTaxonConfidence',
          'unit.interpretations.recordQuality',
          'document.linkings.collectionQuality',
          'unit.recordBasis'
        ]
      },
      {
        header: lajiGISSectionHeader, fields: [
          'document.facts.mappingReason',
          'document.facts.speciesTrackingStatus',
          'document.facts.targetState',
          'document.facts.sourceMaterial',
          'document.facts.sourceDescription'
        ]
      },
      {
        header: 'observation.filters.other', fields: [
          'unit.notes',
          'gathering.notes',
          'document.collectionId',
          'document.sourceId',
          'document.secureLevel',
          'document.secureReasons',
          'document.documentId',
          'unit.unitId',
        ]
      }
    ].filter(set => environment.type === Global.type.vir ? true : set.header !== lajiGISSectionHeader)
  ];

  getSelectFields(selected: string[], query?: any): string[] {
    const selects = super.getSelectFields(selected, query);
    if (query?.editorPersonToken || query?.observerPersonToken || query?.editorOrObserverPersonToken) {
      selects.push('document.quality,gathering.quality,unit.quality');
    }
    return selects;
  }
}
