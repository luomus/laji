import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  TemplateRef,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { IGlobalSpecies } from '../../../../../kerttu-global-shared/models';
import { DatatableColumn } from '../../../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { SelectionType } from '@achimha/ngx-datatable';

@Component({
  selector: 'bsg-species-table',
  templateUrl: './species-table.component.html',
  styleUrls: ['./species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTableComponent implements OnInit, OnChanges {
  @ViewChild('selectTpl', { static: true }) selectTpl!: TemplateRef<any>;

  @Input() species: IGlobalSpecies[] = [];
  @Input() loading = false;
  @Input() selectedSpecies: number[] = [];
  @Input() height = '100%';

  columns: DatatableColumn[] = [];
  selected: IGlobalSpecies[] = [];

  selectionType = SelectionType.checkbox;

  @Output() selectedSpeciesChange = new EventEmitter<number[]>();

  ngOnInit() {
    this.columns = [
      {
        name: 'scientificName',
        label: 'siteSelection.site.name',
        width: 100
      },
      {
        name: 'check',
        label: '',
        canAutoResize: false,
        headerCheckboxable: true,
        checkboxable: true
      }
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.species || changes.selectedSpecies) {
      this.selected = (this.species || []).filter(s => (this.selectedSpecies || []).includes(s.id));
    }
  }

  onSelect(event: { selected: IGlobalSpecies[] }) {
    this.selectedSpecies = event.selected.map(row => row.id);
    this.selectedSpeciesChange.emit(this.selectedSpecies);
  }

  onRowSelect(event: any) {
    if (event.event.target.getAttribute('type') === 'checkbox') {
      return;
    }
    event.rowElement.querySelector('[type="checkbox"]').dispatchEvent(new Event('click'));
    event.event.preventDefault();
  }
}
