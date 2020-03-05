import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {TaxonomyApi} from '../../../shared/api/TaxonomyApi';
import {Taxonomy} from '../../../shared/model/Taxonomy';
import {DatatableColumn} from '../../../shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-expertise-form',
  templateUrl: './expertise-form.component.html',
  styleUrls: ['./expertise-form.component.scss']
})
export class ExpertiseFormComponent implements OnInit {
  @Input() taxonId = 'MX.37580';
  @Input() countThreshold = 50;
  @Input() introText = '';

  columns: DatatableColumn[] = [
    {
      width: 30,
      sortable: false,
      canAutoResize: false,
      draggable: false,
      resizeable: false,
      headerCheckboxable: false,
      checkboxable: true
    },
    {
      name: 'vernacularName',
      label: 'taxonomy.vernacular.name'
    },
    {
      name: 'scientificName',
      label: 'taxonomy.scientific.name',
      cellTemplate: 'taxonScientificName'
    }
  ];
  taxonList$: Observable<Taxonomy[]>;

  @Output() taxonIdSelect = new EventEmitter<string[]>();

  constructor(
    private taxonomyService: TaxonomyApi
  ) { }

  ngOnInit() {
    this.taxonList$ = this.taxonomyService
      .taxonomyFindSpecies(
        this.taxonId,
        'fi',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        '1',
        '1000',
        'taxonomic',
        {
          selectedFields: ['id', 'vernacularName', 'scientificName', 'cursive', 'observationCount'],
          onlyFinnish: true,
          taxonRanks: ['MX.species']
        }
      ).pipe(
        map((result) => result.results),
        map((result) => result.reduce((arr, taxon) => {
          if (taxon.observationCount > this.countThreshold) {
            arr.push(taxon);
          }
          return arr;
        }, []))
      );
  }

  onSelect(event) {
    this.taxonIdSelect.emit(event.selected.map(taxon => taxon.id));
  }
}
