import {Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, TemplateRef, Output, EventEmitter} from '@angular/core';
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
  @Input() loading = false;
  @Input() componentId = 0;

  @ViewChild('occurs', { static: true }) occursTpl: TemplateRef<any>;
  @ViewChild('possiblyOccurs', { static: true }) possiblyOccursTpl: TemplateRef<any>;
  @ViewChild('deleteBtn', { static: true }) deleteBtnTpl: TemplateRef<any>;

  columns: DatatableColumn[];

  taxonAnnotationEnum = TaxonAnnotationEnum;

  @Output() selectedTaxonsChange = new EventEmitter<ITaxonWithAnnotation[]>();

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
      {
        cellTemplate: this.deleteBtnTpl
      }
    ];
  }

  annotationTypeChange(rowIndex: number, value: number) {
    this.selectedTaxons[rowIndex].annotation.annotation = value;
    this.selectedTaxonsChange.emit(this.selectedTaxons);
  }

  deleteRow(rowIndex: number) {
    this.selectedTaxons.splice(rowIndex, 1);
    this.selectedTaxonsChange.emit([...this.selectedTaxons]);
  }
}
