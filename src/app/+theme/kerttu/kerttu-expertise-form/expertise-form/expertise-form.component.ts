import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {map} from 'rxjs/operators';
import {TaxonomyApi} from '../../../../shared/api/TaxonomyApi';
import {Taxonomy} from '../../../../shared/model/Taxonomy';
import {DatatableColumn} from '../../../../shared-modules/datatable/model/datatable-column';
import {SelectionType} from '@swimlane/ngx-datatable';

@Component({
  selector: 'laji-expertise-form',
  templateUrl: './expertise-form.component.html',
  styleUrls: ['./expertise-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpertiseFormComponent implements OnInit {
  @Input() taxonId = 'MX.37580';
  @Input() countThreshold = 50;
  @Input() set selectedTaxonIds(selectedTaxonIds: string[]) {
    this._seletedTaxonIds = selectedTaxonIds;
    this.updateSelected();
  }

  _seletedTaxonIds: string[];
  selected: Taxonomy[] = [];

  columns: DatatableColumn[] = [
    {
      width: 30,
      sortable: false,
      canAutoResize: false,
      draggable: false,
      resizeable: false,
      headerCheckboxable: true,
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
  taxonList: Taxonomy[];

  selectionType = SelectionType;

  private otherTaxonIds: string[];

  @Output() taxonIdSelect = new EventEmitter<string[]>();

  constructor(
    private taxonomyService: TaxonomyApi,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.taxonomyService
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
          selectedFields: ['id', 'vernacularName', 'scientificName', 'cursive', 'observationCountFinland'],
          onlyFinnish: true,
          taxonRanks: ['MX.species']
        }
      ).pipe(
        map((result) => result.results),
        map((result) => result.reduce((arr, taxon) => {
          if (taxon.observationCountFinland > this.countThreshold) {
            arr.push(taxon);
          }
          return arr;
        }, []))
      ).subscribe(taxonList => {
        this.taxonList = taxonList;
        this.updateSelected();
        this.cdr.markForCheck();
    });
  }

  onSelect(selected: Taxonomy[]) {
    this.selected = selected;
    this.taxonIdSelect.emit(selected.map(taxon => taxon.id).concat(this.otherTaxonIds || []));
  }

  onRowSelect(e) {
    if (e.event.target.type === 'checkbox') {
      return;
    }
    const taxon = e.row;
    const filtered = this.selected.filter(t => t.id !== taxon.id);
    if (filtered.length < this.selected.length) {
      this.onSelect(filtered);
    } else {
      this.onSelect([...this.selected, taxon]);
    }
  }

  private updateSelected() {
    if (this.taxonList && this._seletedTaxonIds) {
      this.selected = this.taxonList.filter(taxon => this._seletedTaxonIds.indexOf(taxon.id) > -1);
      const selectedIds = this.selected.map(taxon => taxon.id);
      this.otherTaxonIds = this._seletedTaxonIds.filter(id => selectedIds.indexOf(id) === -1);
    }
  }
}
