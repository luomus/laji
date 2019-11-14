import { Injectable } from '@angular/core';
import { TaxonomyTableColumn } from '../model/taxonomy-table-column';
import { from, Observable, of } from 'rxjs';
import { concatMap, filter, map, toArray } from 'rxjs/operators';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { TranslateService } from '@ngx-translate/core';

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
      selectField: '*.scientificName,*.scientificNameAuthorship,*.cursiveName',
      cellTemplate: 'synonyms',
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
    {
      name: 'observationCount'
    },
    {
      name: 'observationCountFinland'
    }
  ];

  columnLookup = {};
  parents = [
    'domain',
    'kingdom',
    'phylum',
    'subphylum',
    'division',
    'class',
    'subclass',
    'order',
    'suborder',
    'superfamily',
    'family',
    'subfamily',
    'tribe',
    'subtribe',
    'genus',
    'subgenus',
    'aggregate',
    'species'
  ];

  constructor(
    private triplestoreLabelService: TriplestoreLabelService,
    private translateService: TranslateService
  ) {
    for (const parent of this.parents) {
      this.allColumns.push({
        name: 'parent.' + parent + '.scientificName',
        prop: 'parent.' + parent,
        label: ['MX.' + parent, 'MX.scientificName'],
        selectField: ['parent.' + parent + '.scientificName', 'parent.' + parent + '.cursiveName', 'parent.' + parent + '.id'],
        cellTemplate: 'scientificName',
        headerTemplate: 'labelHeader'
      });
      this.allColumns.push({
        name: 'parent.' + parent + '.scientificNameAuthorship',
        label: ['MX.' + parent, 'MX.scientificNameAuthorship'],
        headerTemplate: 'labelHeader'
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

  /**
   * Otherwise same as getColumns but opens the label headers and returns an observable
   */
  getColumns$(selected: string[]): Observable<TaxonomyTableColumn[]> {
    return from(selected).pipe(
      map<string, TaxonomyTableColumn>(name => this.columnLookup[name]),
      filter(column => !!column),
      concatMap(column => (column.headerTemplate === 'labelHeader' ?
        this.openLabel(column.label, true) :
        of(column.label)).pipe(map(label => ({...column, label})))
      ),
      toArray()
    );
  }

  getColumn(name: string): TaxonomyTableColumn {
    return this.columnLookup[name];
  }

  private openLabel(label: string|string[], capitalize: boolean = false): Observable<string|string[]> {
    if (Array.isArray(label)) {
      return from(label).pipe(
        concatMap(l => (this.openLabel(l, capitalize) as any) as string),
        toArray()
      );
    }
    return this.triplestoreLabelService.get(label, this.translateService.currentLang).pipe(
      map(l => capitalize && l ? l.charAt(0).toUpperCase() + l.slice(1) : l)
    );
  }
}
