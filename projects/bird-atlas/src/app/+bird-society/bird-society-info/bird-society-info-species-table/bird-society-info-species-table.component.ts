import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, TemplateRef, ViewChild } from '@angular/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import { AtlasTaxon } from '../../../core/atlas-api.service';

type AugmentedAtlasTaxon = AtlasTaxon & {
  classCounts: {
    // the classCounts object contains keys like 'MY.atlasClassEnumD': number;
    // which does not work with ngxDataTable row props
    certain: number;
    all: number;
  };
};

@Component({
  selector: 'ba-bird-society-info-species-table',
  templateUrl: 'bird-society-info-species-table.component.html',
  styleUrls: ['bird-society-info-species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyInfoSpeciesTableComponent implements OnChanges, AfterViewInit {
  @ViewChild('alignRight') alignRightTemplate: TemplateRef<any>;

  @Input() taxa: AtlasTaxon[];
  @Output() rowClick = new EventEmitter<AtlasTaxon | null>();

  rows: AugmentedAtlasTaxon[];
  cols: TableColumn[];
  selected: AtlasTaxon[] = [];

  constructor() {}

  ngAfterViewInit(): void {
    this.cols = [{
      prop: 'vernacularName.fi',
      name: 'Nimi',
      resizeable: false,
      sortable: true
    }, {
      prop: 'scientificName',
      name: 'Tieteellinen nimi',
      resizeable: false,
      sortable: true
    }, {
      prop: 'classCounts.certain',
      name: 'Varmat',
      resizeable: false,
      sortable: true,
      maxWidth: 60,
      cellTemplate: this.alignRightTemplate
    }, {
      prop: 'classCounts.all',
      name: 'Kaikki',
      resizeable: false,
      sortable: true,
      maxWidth: 60,
      cellTemplate: this.alignRightTemplate
    }];
  }

  ngOnChanges() {
    this.rows = this.taxa.map(t => (<AugmentedAtlasTaxon>{...t, classCounts: {certain: t.classCounts['MY.atlasClassEnumD'], all: t.classCounts.all}}));
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

  onDownloadCsv() {
    const _rows: string[][] = [
      ['Nimi', 'Tieteellinen nimi', 'Varmat', 'Kaikki'],
      ...this.rows.map(r => [r.vernacularName.fi, r.scientificName, `"${r.classCounts.certain}"`, `"${r.classCounts.all}"`])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + _rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }
}
