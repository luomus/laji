import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import { AtlasTaxon } from '../../../core/atlas-api.service';

@Component({
  selector: 'ba-bird-society-info-species-table',
  templateUrl: 'bird-society-info-species-table.component.html',
  styleUrls: ['bird-society-info-species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyInfoSpeciesTableComponent implements OnChanges {
  @Input() taxa: AtlasTaxon[];
  @Output() rowClick = new EventEmitter<AtlasTaxon | null>();

  rows: AtlasTaxon[];
  cols: TableColumn[];
  selected: AtlasTaxon[] = [];

  constructor() {
    this.cols = [{
      prop: 'vernacularName.fi',
      name: 'Nimi',
      resizeable: false,
      sortable: true
    }, {
      prop: 'scientificName',
      name: 'Tieteellinen Nimi',
      resizeable: false,
      sortable: true
    }];
  }

  ngOnChanges() {
    this.rows = this.taxa;
  }

  selectCheck(row: AtlasTaxon) {
    return this.selected.indexOf(row) === -1;
  }

  onActivate(e: any) {
    if (e.type !== 'click') { return; }
    if (this.selected.length > 0) {
      this.rowClick.emit(this.selected[0]);
      return;
    }
    this.rowClick.emit(null);
  }
}
