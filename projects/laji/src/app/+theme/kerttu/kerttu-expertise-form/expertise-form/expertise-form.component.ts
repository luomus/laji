import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Taxonomy} from '../../../../shared/model/Taxonomy';
import {DatatableColumn} from '../../../../shared-modules/datatable/model/datatable-column';
import {SelectionType} from '@swimlane/ngx-datatable';

@Component({
  selector: 'laji-expertise-form',
  templateUrl: './expertise-form.component.html',
  styleUrls: ['./expertise-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpertiseFormComponent implements OnChanges {
  @Input() taxonList: Taxonomy[];
  @Input() selectedTaxonIds: string[];

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

  selectionType = SelectionType;

  private otherTaxonIds: string[];

  @Output() taxonIdSelect = new EventEmitter<string[]>();

  ngOnChanges() {
    this.updateSelected();
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
    if (this.taxonList && this.selectedTaxonIds) {
      this.selected = this.taxonList.filter(taxon => this.selectedTaxonIds.indexOf(taxon.id) > -1);
      const selectedIds = this.selected.map(taxon => taxon.id);
      this.otherTaxonIds = this.selectedTaxonIds.filter(id => selectedIds.indexOf(id) === -1);
    }
  }
}
