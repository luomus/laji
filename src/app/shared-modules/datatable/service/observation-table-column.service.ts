import { Injectable } from '@angular/core';
import { IColumnGroup, TableColumnService } from './table-column.service';
import { ObservationTableColumn } from '../../observation-result/model/observation-table-column';

export interface IColumns {
  'document.documentId': ObservationTableColumn;
  'unit.unitId': ObservationTableColumn;
  'unit.taxon': ObservationTableColumn;
  'unit.taxonVerbatim': ObservationTableColumn;
  'unit.linkings.taxon.vernacularName': ObservationTableColumn;
  'unit.linkings.taxon.scientificName': ObservationTableColumn;
  'unit.linkings.taxon.taxonomicOrder': ObservationTableColumn;
  'unit.species': ObservationTableColumn;
  'unit.linkings.species.vernacularName': ObservationTableColumn;
  'unit.linkings.species.scientificName': ObservationTableColumn;
  'unit.linkings.species.taxonomicOrder': ObservationTableColumn;
  'unit.reportedTaxonConfidence': ObservationTableColumn;
  'unit.interpretations.recordQuality': ObservationTableColumn;
  'gathering.team': ObservationTableColumn;
  'gathering.interpretations.countryDisplayname': ObservationTableColumn;
  'gathering.interpretations.biogeographicalProvinceDisplayname': ObservationTableColumn;
  'gathering.interpretations.municipalityDisplayname': ObservationTableColumn;
  'gathering.team.memberName': ObservationTableColumn;
  'gathering.locality': ObservationTableColumn;
  'gathering.displayDateTime': ObservationTableColumn;
  'gathering.interpretations.coordinateAccuracy': ObservationTableColumn;
  'unit.abundanceString': ObservationTableColumn;
  'unit.interpretations.individualCount': ObservationTableColumn;
  'unit.lifeStage': ObservationTableColumn;
  'unit.sex': ObservationTableColumn;
  'unit.recordBasis': ObservationTableColumn;
  'unit.media.mediaType': ObservationTableColumn;
  'document.collectionId': ObservationTableColumn;
  'unit.notes': ObservationTableColumn;
  'document.secureLevel': ObservationTableColumn;
  'document.secureReasons': ObservationTableColumn;
  'document.sourceId': ObservationTableColumn;
  'document.linkings.collectionQuality': ObservationTableColumn;
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
  'gathering.conversions.ykj': ObservationTableColumn;
  'gathering.conversions.ykj10km': ObservationTableColumn;
  'gathering.conversions.ykj10kmCenter': ObservationTableColumn;
  'gathering.conversions.ykj1km': ObservationTableColumn;
  'gathering.conversions.ykj1kmCenter': ObservationTableColumn;
  'gathering.conversions.euref': ObservationTableColumn;
  'gathering.conversions.wgs84': ObservationTableColumn;
  'gathering.interpretations.country': ObservationTableColumn;
  'sample.sampleId': ObservationTableColumn;
  'sample.type': ObservationTableColumn;
  'sample.material': ObservationTableColumn;
  'sample.quality': ObservationTableColumn;
  'sample.status': ObservationTableColumn;
  'sample.notes': ObservationTableColumn;
  'sample.collectionId': ObservationTableColumn;
  'document.facts.legID': ObservationTableColumn;
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
    required: true
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
  'unit.reportedTaxonConfidence': {name: 'unit.reportedTaxonConfidence', cellTemplate: 'warehouseLabel'},
  'unit.interpretations.recordQuality': {
    name: 'unit.interpretations.recordQuality',
    cellTemplate: 'warehouseLabel',
    label: 'result.unit.quality.taxon',
    sortable: false
  },
  'gathering.team': {name: 'gathering.team', cellTemplate: 'toSemicolon', required: true},
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
    required: true
  },
  'gathering.team.memberName': {
    name: 'gathering.team.memberName',
    label: 'observation.form.team',
    aggregateBy: 'gathering.team.memberId,gathering.team.memberName'
  },
  'gathering.locality': {name: 'gathering.locality'},
  'gathering.displayDateTime': {name: 'gathering.displayDateTime', required: true},
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
  'unit.notes': {name: 'unit.notes', sortable: false, label: 'result.document.notes'},
  'document.documentId': {name: 'document.documentId', required: true},
  'unit.unitId': {name: 'unit.unitId'},
  'document.secureLevel': {name: 'document.secureLevel', cellTemplate: 'warehouseLabel'},
  'document.secureReasons': {name: 'document.secureReasons', sortable: false, cellTemplate: 'warehouseLabel'},
  'document.sourceId': {name: 'document.sourceId', cellTemplate: 'label', sortable: false},
  'document.linkings.collectionQuality': {name: 'document.linkings.collectionQuality', cellTemplate: 'warehouseLabel', sortable: false},
  'unit.det': {name: 'unit.det'},
  'gathering.conversions.dayOfYearBegin': {name: 'gathering.conversions.dayOfYearBegin'},
  'gathering.conversions.dayOfYearEnd': {name: 'gathering.conversions.dayOfYearEnd'},
  'unit.superRecordBasis': {
    name: 'unit.superRecordBasis',
    cellTemplate: 'warehouseLabel',
    label: 'observation.active.superRecordBasis'
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
  'gathering.conversions.ykj': {
    name: 'gathering.conversions.ykj',
    prop: 'gathering.conversions.ykj.verbatim',
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
    required: true
  },
  'gathering.conversions.wgs84': {
    name: 'gathering.conversions.wgs84',
    prop: 'gathering.conversions.wgs84.verbatim',
    sortable: false
  },
  'gathering.interpretations.country': {
    transform: 'label',
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
  'document.facts.legID': {name: 'document.facts.legID', sortable: false, fact: 'MY.legID'},
  'sample.facts.preparationMaterials': {
    name: 'sample.facts.preparationMaterials',
    transform: 'label',
    sortable: false,
    fact: 'MF.preparationMaterials'
  },
  'sample.facts.elutionMedium': {
    name: 'sample.facts.elutionMedium',
    transform: 'label',
    sortable: false,
    fact: 'MF.elutionMedium'
  },
  'sample.facts.additionalIDs': {name: 'sample.facts.additionalIDs', sortable: false, fact: 'MF.additionalIDs'},
  'sample.facts.qualityCheckMethod': {
    name: 'sample.facts.qualityCheckMethod',
    transform: 'label',
    sortable: false,
    fact: 'MF.qualityCheckMethod'
  },
  'sample.facts.DNAVolumeMicroliters': {
    name: 'sample.facts.DNAVolumeMicroliters',
    sortable: false,
    fact: 'MY.DNAVolumeMicroliters'
  },
  'sample.facts.DNARatioOfAbsorbance260And280': {
    name: 'sample.facts.DNARatioOfAbsorbance260And280',
    sortable: false,
    fact: 'MY.DNARatioOfAbsorbance260And280'
  },
  'sample.facts.DNAConcentrationNgPerMicroliter': {
    name: 'sample.facts.DNAConcentrationNgPerMicroliter',
    sortable: false,
    fact: 'MY.DNAConcentrationNgPerMicroliter'
  },
};


@Injectable()
export class ObservationTableColumnService extends TableColumnService<ObservationTableColumn, IColumns> {

  protected defaultFields: Array<keyof IColumns> = [
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
    COLUMNS['unit.species'],
    COLUMNS['unit.linkings.species.vernacularName'],
    COLUMNS['unit.linkings.species.scientificName'],
    COLUMNS['unit.linkings.species.taxonomicOrder'],
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
    COLUMNS['unit.interpretations.individualCount'],
    COLUMNS['unit.lifeStage'],
    COLUMNS['unit.sex'],
    COLUMNS['unit.recordBasis'],
    COLUMNS['unit.media.mediaType'],
    COLUMNS['document.collectionId'],
    COLUMNS['unit.notes'],
    COLUMNS['document.secureLevel'],
    COLUMNS['document.secureReasons'],
    COLUMNS['document.sourceId'],
    COLUMNS['document.linkings.collectionQuality'],
    COLUMNS['unit.det'],
    COLUMNS['gathering.conversions.dayOfYearBegin'],
    COLUMNS['gathering.conversions.dayOfYearEnd'],
    COLUMNS['unit.superRecordBasis'],
    COLUMNS['oldestRecord'],
    COLUMNS['newestRecord'],
    COLUMNS['count'],
    COLUMNS['individualCountMax'],
    COLUMNS['individualCountSum'],
    COLUMNS['pairCountSum'],
    COLUMNS['gathering.conversions.ykj'],
    COLUMNS['gathering.conversions.ykj10km'],
    COLUMNS['gathering.conversions.ykj10kmCenter'],
    COLUMNS['gathering.conversions.ykj1km'],
    COLUMNS['gathering.conversions.ykj1kmCenter'],
    COLUMNS['gathering.conversions.euref'],
    COLUMNS['gathering.conversions.wgs84'],
    COLUMNS['gathering.interpretations.coordinateAccuracy'],
  ];

  protected columnGroups: IColumnGroup<IColumns>[][] = [
    [
      {
        header: 'identification', fields: [
          'unit.taxon',
          'unit.linkings.taxon.vernacularName',
          'unit.linkings.taxon.scientificName',
          'unit.taxonVerbatim'
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
        header: 'result.gathering.coordinatesVerbatim', fields: [
          'gathering.conversions.ykj',
          'gathering.conversions.ykj10kmCenter',
          'gathering.conversions.ykj10km',
          'gathering.conversions.ykj1kmCenter',
          'gathering.conversions.ykj1km',
          'gathering.conversions.euref',
          'gathering.conversions.wgs84',
          'gathering.interpretations.coordinateAccuracy'
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
        header: 'observation.filters.other', fields: [
          'unit.notes',
          'document.collectionId',
          'document.sourceId',
          'document.secureLevel',
          'document.secureReasons',
          'document.documentId',
          'unit.unitId',
        ]
      }
    ]
  ];

  getSelectFields(selected: string[], query?: any): string[] {
    const selects = super.getSelectFields(selected, query);
    if (query?.editorPersonToken || query?.observerPersonToken || query?.editorOrObserverPersonToken) {
      selects.push('document.quality,gathering.quality,unit.quality');
    }
    return selects;
  }
}
