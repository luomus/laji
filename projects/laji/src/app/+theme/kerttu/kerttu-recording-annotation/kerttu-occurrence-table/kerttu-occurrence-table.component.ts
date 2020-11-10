import {Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, TemplateRef, Output, EventEmitter} from '@angular/core';
import {ITaxonWithAnnotation, TaxonAnnotationEnum} from '../../models';
import {DatatableColumn} from '../../../../shared-modules/datatable/model/datatable-column';
import {ModalDirective} from 'ngx-bootstrap/modal';

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
  @Input() taxonExpertise: string[];

  @ViewChild('occurs', { static: true }) occursTpl: TemplateRef<any>;
  @ViewChild('possiblyOccurs', { static: true }) possiblyOccursTpl: TemplateRef<any>;
  @ViewChild('warning', { static: true }) warningTpl: TemplateRef<any>;
  @ViewChild('buttons', { static: true }) buttonsTpl: TemplateRef<any>;

  @ViewChild('modal') public modalComponent: ModalDirective;

  columns: DatatableColumn[];

  taxonAnnotationEnum = TaxonAnnotationEnum;

  modalTaxon: ITaxonWithAnnotation;

  @Output() selectedTaxonsChange = new EventEmitter<ITaxonWithAnnotation[]>();
  @Output() addToTaxonExpertise = new EventEmitter<string>();

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
        cellTemplate: this.buttonsTpl,
        width: 150,
        minWidth: 150
      }
    ];
  }

  annotationTypeChange(rowIndex: number, value: number) {
    this.selectedTaxons[rowIndex].annotation.annotation = value;
    this.selectedTaxonsChange.emit(this.selectedTaxons);
  }

  deleteRow(rowIndex) {
    this.selectedTaxons.splice(rowIndex, 1);
    this.selectedTaxonsChange.emit([...this.selectedTaxons]);
  }

  showModal(taxon: ITaxonWithAnnotation) {
    this.modalTaxon = taxon;
    this.modalComponent.show();
  }

  closeModal(addTaxonToExpertise = false) {
    if (addTaxonToExpertise) {
      this.addToTaxonExpertise.emit(this.modalTaxon.annotation.taxonId);
    }
    this.modalComponent.hide();
  }
}
