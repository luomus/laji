import {Component, OnChanges, Input, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import {ModalDirective} from 'ngx-bootstrap';
import { IdService } from '../../../../shared/service/id.service';

@Component({
  selector: 'laji-taxon-specimens',
  templateUrl: './taxon-specimens.component.html',
  styleUrls: ['./taxon-specimens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSpecimensComponent implements OnChanges {
  @ViewChild('documentModal') public modal: ModalDirective;
  @Input() taxon: Taxonomy;

  collectionId: string;

  documentId: string;
  highlightId: string;
  documentModalVisible = false;

  constructor() { }

  ngOnChanges() {
    this.collectionId = undefined;
  }

  showDocument(event) {
    const row = event.row || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.highlightId = row.unit.unitId;
      this.documentId = row.document.documentId;
      this.documentModalVisible = true;
      this.modal.show();
    }
  }

  onHideDocument() {
    this.documentModalVisible = false;
  }

  setCollectionId(event) {
    const row = event.row || {};
    if (row.document && row.document.collectionId) {
      this.collectionId = IdService.getId(row.document.collectionId);
      setTimeout(() => {
        const el = document.getElementById('collectionSpecimens');
        if (el) {
          el.scrollIntoView();
        }
      }, 0);
    }
  }
}
