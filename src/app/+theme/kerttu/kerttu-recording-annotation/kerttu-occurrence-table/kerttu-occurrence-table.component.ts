import {Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, ViewChild, TemplateRef} from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import {DatatableColumn} from '../../../../shared-modules/datatable/model/datatable-column';
import {Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-kerttu-occurrence-table',
  templateUrl: './kerttu-occurrence-table.component.html',
  styleUrls: ['./kerttu-occurrence-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuOccurrenceTableComponent implements OnInit, OnChanges {
  @Input() selectedTaxons: Taxonomy[];

  @ViewChild('radioButton', { static: true }) radioButtonTpl: TemplateRef<any>;

  columns: DatatableColumn[];

  selectionType = SelectionType;

  constructor() { }

  ngOnInit() {
    this.columns = [
      {
        name: 'vernacularName',
        label: 'taxonomy.vernacular.name'
      },
      {
        name: 'scientificName',
        label: 'taxonomy.scientific.name',
        cellTemplate: 'taxonScientificName'
      },
      {
        label: 'Esiintyy varmasti',
        cellTemplate: this.radioButtonTpl
      },
      {
        label: 'Esiintyy mahdollisesti',
        cellTemplate: this.radioButtonTpl
      },
    ];
  }

  ngOnChanges(changes) {

  }
}
