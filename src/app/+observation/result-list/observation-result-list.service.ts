import { Injectable } from '@angular/core';
import { ObservationTableColumn } from '../../shared-modules/observation-result/model/observation-table-column';

export interface IColumnGroup {
  header: string;
  fields: string[];
}

@Injectable()
export class ObservationResultListService {

  private _defaultFields: string[] = [
    'unit.taxon',
    'unit.abundanceString',
    'gathering.displayDateTime',
    'gathering.interpretations.countryDisplayname',
    'gathering.interpretations.biogeographicalProvinceDisplayname',
    'gathering.interpretations.municipalityDisplayname',
    'gathering.locality',
    'document.collectionId',
    'gathering.team'
  ];

  private _columnGroups: IColumnGroup[] = [
    { header: 'identification', fields: [
        'unit.taxon',
        'unit.linkings.taxon.vernacularName',
        'unit.linkings.taxon.scientificName',
        'unit.taxonVerbatim'
      ]},
    { header: 'observation.form.date', fields: [
        'gathering.displayDateTime',
        'gathering.conversions.dayOfYearBegin',
        'gathering.conversions.dayOfYearEnd'
      ]},
    { header: 'persons', fields: [
        'gathering.team',
        'unit.det'
      ]},
    { header: 'observation.form.unit', fields: [
        'unit.abundanceString',
        'unit.interpretations.individualCount',
        'unit.lifeStage',
        'unit.sex'
      ]},
    { header: 'observation.form.place', fields: [
        'gathering.locality',
        'gathering.interpretations.municipalityDisplayname',
        'gathering.interpretations.biogeographicalProvinceDisplayname',
        'gathering.interpretations.countryDisplayname'
      ]},
    { header: 'result.gathering.coordinatesVerbatim', fields: [
        'gathering.conversions.ykj',
        'gathering.conversions.ykj10kmCenter',
        'gathering.conversions.ykj10km',
        'gathering.conversions.ykj1kmCenter',
        'gathering.conversions.ykj1km',
        'gathering.conversions.euref',
        'gathering.conversions.wgs84',
        'gathering.interpretations.coordinateAccuracy'
      ]},
    { header: 'reliability', fields: [
        'unit.reportedTaxonConfidence',
        'unit.quality.taxon.reliability',
        'unit.quality.taxon.source',
        'document.quality.reliabilityOfCollection',
        'unit.recordBasis'
      ]},
    { header: 'observation.filters.other', fields: [
        'unit.notes',
        'unit.recordBasis',
        'document.collectionId',
        'document.sourceId',
        'document.secureLevel',
        'document.secureReasons'
      ]}
  ];

  private _allColumns: ObservationTableColumn[] = [
    { name: 'unit.taxon',
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
      width: 300
    },
    { name: 'unit.taxonVerbatim',
      prop: 'unit.taxonVerbatim',
      label: 'taxonVerbatim' },
    { name: 'unit.linkings.taxon.vernacularName',
      cellTemplate: 'multiLang',
      sortBy: 'unit.linkings.taxon.name%longLang%',
      label: 'taxonomy.vernacular.name',
      aggregateBy: 'unit.linkings.taxon.id,' +
        'unit.linkings.taxon.nameFinnish,' +
        'unit.linkings.taxon.nameEnglish,' +
        'unit.linkings.taxon.nameSwedish' },
    { name: 'unit.linkings.taxon.scientificName',
      prop: 'unit.linkings.taxon',
      cellTemplate: 'scientificName',
      label: 'result.scientificName',
      selectField: 'unit.linkings.taxon.scientificName,unit.linkings.taxon.cursiveName',
      sortBy: 'unit.linkings.taxon.scientificName',
      aggregateBy: 'unit.linkings.taxon.id,unit.linkings.taxon.scientificName,unit.linkings.taxon.cursiveName' },
    { name: 'unit.linkings.taxon.taxonomicOrder',
      label: 'result.taxonomicOrder',
      aggregateBy: 'unit.linkings.taxon.id,unit.linkings.taxon.taxonomicOrder',
      width: 70 },
    { name: 'unit.species',
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
    { name: 'unit.linkings.species.vernacularName',
      prop: 'unit.linkings.taxon.speciesVernacularName',
      cellTemplate: 'multiLang',
      sortBy: 'unit.linkings.taxon.speciesName%longLang%',
      label: 'taxonomy.vernacular.name',
      aggregateBy: 'unit.linkings.taxon.speciesId,' +
        'unit.linkings.taxon.speciesNameFinnish,' +
        'unit.linkings.taxon.speciesNameEnglish,' +
        'unit.linkings.taxon.speciesNameSwedish' },
    { name: 'unit.linkings.species.scientificName',
      prop: 'unit.linkings.taxon.speciesScientificName',
      label: 'result.scientificName',
      cellTemplate: 'cursive',
      sortBy: 'unit.linkings.taxon.speciesScientificName',
      aggregateBy: 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName' },
    { name: 'unit.linkings.species.taxonomicOrder',
      prop: 'unit.linkings.taxon.speciesTaxonomicOrder',
      label: 'result.taxonomicOrder',
      aggregateBy: 'unit.linkings.taxon.species,unit.linkings.taxon.speciesTaxonomicOrder',
      width: 70 },
    { name: 'unit.reportedTaxonConfidence', cellTemplate: 'warehouseLabel' },
    { name: 'unit.quality.taxon.reliability', cellTemplate: 'warehouseLabel', label: 'result.unit.quality.taxon' },
    { name: 'unit.quality.taxon.source', cellTemplate: 'warehouseLabel', label: 'result.unit.quality.source' },
    { name: 'gathering.team', cellTemplate: 'toSemicolon' },
    { name: 'gathering.interpretations.countryDisplayname', label: 'result.gathering.country' },
    { name: 'gathering.interpretations.biogeographicalProvinceDisplayname',
      cellTemplate: 'warehouseLabel',
      label: 'result.gathering.biogeographicalProvince',
      aggregateBy: 'gathering.interpretations.biogeographicalProvince,gathering.interpretations.biogeographicalProvinceDisplayname'
    },
    { name: 'gathering.interpretations.municipalityDisplayname',
      cellTemplate: 'warehouseLabel',
      label: 'observation.form.municipality',
      aggregateBy: 'gathering.interpretations.finnishMunicipality,gathering.interpretations.municipalityDisplayname'
    },
    { name: 'gathering.team.memberName',
      label: 'observation.form.team',
      aggregateBy: 'gathering.team.memberId,gathering.team.memberName'
    },
    { name: 'gathering.locality' },
    { name: 'gathering.displayDateTime' },
    { name: 'gathering.interpretations.coordinateAccuracy', cellTemplate: 'numeric' },
    { name: 'gathering.conversions.ykj10kmCenter', sortable: false},
    { name: 'unit.abundanceString', cellTemplate: 'numeric', sortBy: 'unit.interpretations.individualCount,unit.abundanceString' },
    { name: 'unit.interpretations.individualCount', cellTemplate: 'numeric' },
    { name: 'unit.lifeStage', cellTemplate: 'warehouseLabel', label: 'observation.form.lifeStage' },
    { name: 'unit.sex', cellTemplate: 'warehouseLabel', label: 'observation.form.sex' },
    { name: 'unit.recordBasis', cellTemplate: 'warehouseLabel', label: 'observation.filterBy.recordBasis' },
    { name: 'unit.media.mediaType', cellTemplate: 'warehouseLabel', label: 'observation.filterBy.image' },
    { name: 'document.collectionId', prop: 'document.collection', width: 300, sortable: false },
    { name: 'unit.notes', sortable: false, label: 'result.document.notes' },
    { name: 'document.secureLevel', cellTemplate: 'warehouseLabel' },
    { name: 'document.secureReasons', sortable: false, cellTemplate: 'warehouseLabel' },
    { name: 'document.sourceId', prop: 'document.source', sortable: false },
    { name: 'document.quality.reliabilityOfCollection'},
    { name: 'unit.det'},
    { name: 'gathering.conversions.dayOfYearBegin'},
    { name: 'gathering.conversions.dayOfYearEnd'},
    { name: 'unit.superRecordBasis', cellTemplate: 'warehouseLabel', label: 'observation.active.superRecordBasis' },
    { name: 'oldestRecord', width: 85 },
    { name: 'newestRecord', width: 85 },
    { name: 'count', draggable: false, label: 'theme.countShort', width: 75, cellTemplate: 'numeric' },
    { name: 'individualCountMax', label: 'theme.individualCountMax', width: 80, cellTemplate: 'numeric' },
    { name: 'individualCountSum', label: 'theme.individualCount', width: 80, cellTemplate: 'numeric' },
    { name: 'pairCountSum', label: 'theme.pairCount', width: 75, cellTemplate: 'numeric', aggregate: false},
    { name: 'gathering.conversions.ykj', prop: 'gathering.conversions.ykj.verbatim', sortable: false },
    { name: 'gathering.conversions.ykj10km', prop: 'gathering.conversions.ykj10km.verbatim', sortable: false },
    { name: 'gathering.conversions.ykj10kmCenter', prop: 'gathering.conversions.ykj10kmCenter.verbatim', sortable: false },
    { name: 'gathering.conversions.ykj1km', prop: 'gathering.conversions.ykj1km.verbatim', sortable: false },
    { name: 'gathering.conversions.ykj1kmCenter', prop: 'gathering.conversions.ykj1kmCenter.verbatim', sortable: false },
    { name: 'gathering.conversions.euref', prop: 'gathering.conversions.euref.verbatim', sortable: false },
    { name: 'gathering.conversions.wgs84', prop: 'gathering.conversions.wgs84.verbatim', sortable: false },
    { name: 'gathering.interpretations.coordinateAccuracy' }
  ];

  constructor() { }

  set defaultFields(fields: string[]) {
    this._defaultFields = fields;
  }

  get defaultFields() {
    return [...this._defaultFields];
  }

  set columnGroups(groups: IColumnGroup[]) {
    this._columnGroups = groups;
  }

  get columnGroups() {
    return this._columnGroups;
  }

  set allColumns(cols: ObservationTableColumn[]) {
    this._allColumns = cols;
  }

  get allColumns() {
    return this._allColumns;
  }
}
