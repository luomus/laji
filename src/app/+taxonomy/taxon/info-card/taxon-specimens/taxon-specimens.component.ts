import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges } from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { IdService } from '../../../../shared/service/id.service';
import { DOCUMENT } from '@angular/common';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { InfoCardQueryService } from '../shared/service/info-card-query.service';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';

@Component({
  selector: 'laji-taxon-specimens',
  templateUrl: './taxon-specimens.component.html',
  styleUrls: ['./taxon-specimens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSpecimensComponent implements OnChanges {
  @Input() taxon: Taxonomy;

  typeSpecimenQuery: WarehouseQueryInterface;
  collectionSpecimenQuery: WarehouseQueryInterface;
  collectionQuery: WarehouseQueryInterface;

  typeSpecimensTotal: number;
  collectionsTotal: number;

  collectionId: string;

  documentId: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  ngOnChanges() {
    this.typeSpecimenQuery = InfoCardQueryService.getSpecimenQuery(this.taxon.id, true);
    this.collectionSpecimenQuery = InfoCardQueryService.getSpecimenQuery(this.taxon.id, false);
    this.collectionId = undefined;
  }

  showDocument(event) {
    const row = event.row || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.documentViewerFacade.showDocumentID({
        highlight: row.unit.unitId,
        document: row.document.documentId,
        openAnnotation: false,
        result: undefined
      });
    }
  }

  setCollectionId(event) {
    const row = event.row || {};
    if (row.document && row.document.collectionId) {
      this.collectionId = IdService.getId(row.document.collectionId);
      this.collectionQuery = InfoCardQueryService.getSpecimenQuery(this.taxon.id, false, this.collectionId);

      setTimeout(() => {
        const el = this.document.getElementById('collectionSpecimens');
        if (el) {
          el.scrollIntoView();
        }
      }, 0);
    }
  }
}
