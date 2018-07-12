import { Injectable } from '@angular/core';
import { ObservationTableColumn } from '../../shared-modules/observation-result/model/observation-table-column';

@Injectable()
export class TaxonomyColumns {
  allColumns: ObservationTableColumn[] = [
    {
      name: 'id',
      label: 'taxonomy.card.id',
      width: 95
    },
    {
      name: 'taxonRank',
      label: 'taxonomy.rank',
      cellTemplate: 'label',
      width: 90
    },
    {
      name: 'scientificName',
      selectField: 'scientificName,cursiveName',
      label: 'taxonomy.scientific.name',
      cellTemplate: 'taxonScientificName',
      width: 200
    },
    {
      name: 'scientificNameAuthorship',
      label: 'taxonomy.author',
      width: 200
    },
    {
      name: 'vernacularName',
      label: 'taxonomy.vernacular.name',
      cellTemplate: 'multiLang',
      width: 200
    },
    {
      name: 'synonymNames',
      cellTemplate: 'cursive',
      width: 200
    },
    {
      name: 'vernacularName.fi',
      label: 'taxonomy.vernacular.name.fi',
      selectField: 'vernacularName',
      width: 200
    },
    {
      name: 'vernacularName.sv',
      label: 'taxonomy.vernacular.name.sv',
      selectField: 'vernacularName',
      width: 200
    },
    {
      name: 'vernacularName.en',
      label: 'taxonomy.vernacular.name.en',
      selectField: 'vernacularName',
      width: 200
    },
    {
      name: 'alternativeVernacularName',
      label: 'taxonomy.alternative.vernacular.names',
      cellTemplate: 'multiLangAll',
      width: 200
    },
    {
      name: 'obsoleteVernacularName',
      label: 'taxonomy.obsolete.vernacular.name',
      cellTemplate: 'multiLangAll',
      width: 200
    },
    {
      name: 'tradeName',
      label: 'taxonomy.trade.name',
      cellTemplate: 'multiLangAll',
      width: 200
    },
    {
      name: 'finnish',
      cellTemplate: 'boolean',
      width: 90
    },
    {
      name: 'typeOfOccurrenceInFinland',
      cellTemplate: 'labelArray'
    },
    {
      name: 'typeOfOccurrenceInFinlandNotes'
    },
    {
      name: 'occurrenceInFinlandPublication',
      cellTemplate: 'publicationArray',
      width: 200
    },
    {
      name: 'originalPublication',
      cellTemplate: 'publication',
      width: 200
    },
    {
      name: 'latestRedListStatusFinland',
      cellTemplate: 'iucnStatus',
      width: 90
    },
    {
      name: 'informalTaxonGroups',
      cellTemplate: 'labelArray',
      width: 200
    },
    {
      name: 'invasiveSpecies',
      cellTemplate: 'boolean',
      width: 90
    },
    {
      name: 'administrativeStatuses',
      cellTemplate: 'labelArray',
      width: 200
    },
    {
      name: 'taxonExpert',
      cellTemplate: 'user'
    },
    {
      name: 'notes'
    }
  ];

  columnLookup = {};

  constructor() {
    this.allColumns = this.allColumns
      .map(column => {
        this.columnLookup[column.name] = column;
        if (!column.label) {
          column.label = 'taxonomy.' + column.name;
        }
        return column;
      });
  }

  getColumns(selected) {
    return selected.map(name => {
      return this.columnLookup[name];
    });
  }
}
