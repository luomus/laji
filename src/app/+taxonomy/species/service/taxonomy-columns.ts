import { Injectable } from '@angular/core';
import { TaxonomyTableColumn } from '../model/taxonomy-table-column';

@Injectable({
  providedIn: 'root'
})
export class TaxonomyColumns {
  allColumns: TaxonomyTableColumn[] = [
    {
      name: 'id',
      label: 'taxonomy.card.id',
      width: 95
    },
    {
      name: 'taxonRank',
      label: 'taxonomy.rank',
      cellTemplate: 'label',
      width: 130
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
      label: 'taxonomy.synonyms',
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
      name: 'occurrenceInFinlandPublications',
      cellTemplate: 'publicationArray',
      width: 200
    },
    {
      name: 'originalPublications',
      cellTemplate: 'publication',
      width: 200
    },
    {
      name: 'latestRedListStatusFinland',
      cellTemplate: 'iucnStatus',
      width: 140
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
    },
    {
      name: 'habitats',
      selectField: 'primaryHabitat,secondaryHabitats',
      cellTemplate: 'taxonHabitats'
    },
  ];

  columnLookup = {};

  constructor() {
    for (const parent of ['domain', 'kingdom', 'phylum', 'division', 'class', 'order', 'family', 'tribe', 'genus']) {
      this.allColumns.push({
        name: 'parent.' + parent + '.scientificName',
        prop: 'parent.' + parent,
        label: ['taxonomy.parent.' + parent, 'taxonomy.scientific.name.lower'],
        selectField: ['parent.' + parent + '.scientificName', 'parent.' + parent + '.cursiveName'],
        cellTemplate: 'scientificName'
      });
      this.allColumns.push({
        name: 'parent.' + parent + '.scientificNameAuthorship',
        label: ['taxonomy.parent.' + parent, 'taxonomy.author.lower']
      });
    }

    this.allColumns = this.allColumns
      .map(column => {
        this.columnLookup[column.name] = column;

        if (!column.label) {
          column.label = 'taxonomy.' + column.name;
        }

        return column;
      });
  }

  getColumns(selected: string[]): TaxonomyTableColumn[] {
    return selected.reduce((arr, name) => {
      if (this.columnLookup[name]) {
        arr.push({...this.columnLookup[name]});
      }
      return arr;
    }, []);
  }

  getColumn(name: string): TaxonomyTableColumn {
    return this.columnLookup[name];
  }
}
