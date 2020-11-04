import {Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, TemplateRef, Output, EventEmitter} from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import {ITaxonWithAnnotation, TaxonAnnotationEnum} from '../../models';
import {DatatableColumn} from '../../../../shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-kerttu-occurrence-table',
  templateUrl: './kerttu-occurrence-table.component.html',
  styleUrls: ['./kerttu-occurrence-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuOccurrenceTableComponent implements OnInit {
  @Input() selectedTaxons: ITaxonWithAnnotation[];

  @ViewChild('occurs', { static: true }) occursTpl: TemplateRef<any>;
  @ViewChild('possiblyOccurs', { static: true }) possiblyOccursTpl: TemplateRef<any>;

  columns: DatatableColumn[];

  selectionType = SelectionType;
  taxonAnnotationEnum = TaxonAnnotationEnum;

  @Output() annotationChange = new EventEmitter<ITaxonWithAnnotation[]>();

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
        cellTemplate: this.occursTpl
      },
      {
        label: 'Esiintyy mahdollisesti',
        cellTemplate: this.possiblyOccursTpl
      },
    ];
  }

  annotationTypeChange(rowIndex: number, value: number) {
    this.selectedTaxons[rowIndex].annotation.annotation = value;
    this.annotationChange.emit(this.selectedTaxons);
  }
}
