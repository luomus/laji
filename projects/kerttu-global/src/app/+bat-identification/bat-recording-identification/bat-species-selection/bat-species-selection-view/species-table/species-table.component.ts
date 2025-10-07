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
import { TranslateService } from '@ngx-translate/core';

interface SpeciesTableRow extends Omit<IGlobalSpecies, 'id'> {
  id?: number;
}

@Component({
  selector: 'bsg-species-table',
  templateUrl: './species-table.component.html',
  styleUrls: ['./species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTableComponent implements OnInit, OnChanges {
  @ViewChild('selectTpl', { static: true }) selectTpl!: TemplateRef<any>;

  @Input() species: IGlobalSpecies[] = [];
  @Input() unknownSpeciesRecordingCount = 0;
  @Input() loading = false;
  @Input() selectedSpecies: (number|undefined)[] = [];
  @Input() height = '100%';

  rows: SpeciesTableRow[] = [];
  columns: DatatableColumn[] = [];
  selected: SpeciesTableRow[] = [];

  selectionType = SelectionType.checkbox;

  @Output() selectedSpeciesChange = new EventEmitter<(number|undefined)[]>();

  constructor(
    private translate: TranslateService
  ) { }


  ngOnInit() {
    this.columns = [
      {
        name: 'scientificName',
        label: 'speciesSelection.name',
        width: 100
      },
      {
        name: 'recordingCount',
        label: 'speciesSelection.recordingCount',
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
    if ((changes.species || changes.unknownSpeciesCount || changes.loading) && !this.loading) {
      if (this.unknownSpeciesRecordingCount > 0) {
        const unknownSpecies: SpeciesTableRow = {
          scientificName: this.translate.instant('Unknown'),
          recordingCount: this.unknownSpeciesRecordingCount
        };
        this.rows = [...this.species, unknownSpecies];
      } else {
        this.rows = this.species;
      }
    }

    this.selected = this.rows.filter(s => this.selectedSpecies.includes(s.id));
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
