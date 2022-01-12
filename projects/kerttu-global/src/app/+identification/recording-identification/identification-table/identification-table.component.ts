import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, TemplateRef, Output, EventEmitter, OnChanges } from '@angular/core';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { ISpeciesIdentification, SpeciesAnnotationEnum } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-identification-table',
  templateUrl: './identification-table.component.html',
  styleUrls: ['./identification-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationTableComponent implements OnInit, OnChanges {
  @Input() identifications: ISpeciesIdentification[];
  @Input() loading = false;
  @Input() componentId = 0;

  @ViewChild('drawBox', { static: true }) drawBoxTpl: TemplateRef<any>;
  @ViewChild('occurs', { static: true }) occursTpl: TemplateRef<any>;
  @ViewChild('possiblyOccurs', { static: true }) possiblyOccursTpl: TemplateRef<any>;
  @ViewChild('buttons', { static: true }) buttonsTpl: TemplateRef<any>;

  columns: DatatableColumn[];
  drawClickedByIdx = [];

  speciesAnnotationEnum = SpeciesAnnotationEnum;

  @Output() identificationsChange = new EventEmitter<ISpeciesIdentification[]>();
  @Output() drawClick = new EventEmitter<{drawClicked: boolean, rowIndex: number}>();

  ngOnInit() {
    this.columns = [
      {
        label: 'identification.recordings.drawABox',
        cellTemplate: this.drawBoxTpl,
        sortable: false
      },
      {
        name: 'species.commonName',
        label: 'taxonomy.vernacular.name'
      },
      {
        name: 'species.scientificName',
        label: 'taxonomy.scientific.name',
        cellTemplate: 'cursive'
      },
      {
        label: 'theme.kerttu.occurs',
        cellTemplate: this.occursTpl,
        sortable: false
      },
      {
        label: 'theme.kerttu.possiblyOccurs',
        cellTemplate: this.possiblyOccursTpl,
        sortable: false
      },
      {
        cellTemplate: this.buttonsTpl,
        width: 150,
        minWidth: 150,
        sortable: false
      }
    ];
  }

  ngOnChanges() {
    this.drawClickedByIdx = this.identifications.map(() => false);
  }

  annotationTypeChange(rowIndex: number, value: number) {
    this.identifications[rowIndex].occurrence = value;
    this.identificationsChange.emit(this.identifications);
  }

  deleteRow(rowIndex) {
    this.identifications = this.identifications.filter((_, i) => i !== rowIndex);
    this.identificationsChange.emit(this.identifications);
  }

  toggleDrawButton(rowIndex: number) {
    this.drawClickedByIdx = this.drawClickedByIdx.map((value, idx) => {
      if (idx === rowIndex) {
        return !value;
      }
      return false;
    });
    this.drawClick.emit({drawClicked: this.drawClickedByIdx[rowIndex], rowIndex});
  }
}
