import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges, OnInit } from '@angular/core';
import { IdService } from '../../../../shared/service/id.service';
import { DOCUMENT } from '@angular/common';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { InfoCardQueryService } from '../shared/service/info-card-query.service';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { Observable } from 'rxjs';

type Taxon = components['schemas']['Taxon'];

@Component({
  selector: 'laji-taxon-specimens',
  templateUrl: './taxon-specimens.component.html',
  styleUrls: ['./taxon-specimens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSpecimensComponent implements OnChanges, OnInit {
  @Input({ required: true }) taxon!: Taxon;

  typeSpecimenQuery!: WarehouseQueryInterface;
  collectionSpecimenQuery!: WarehouseQueryInterface;
  collectionQuery!: WarehouseQueryInterface;

  typeSpecimensTotal?: number;
  collectionsTotal?: number;

  collectionId?: string;

  documentId?: string;

  isLoggedIn$!: Observable<boolean>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private documentViewerFacade: DocumentViewerFacade,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.isLoggedIn$ = this.userService.isLoggedIn$;
  }

  ngOnChanges() {
    this.typeSpecimenQuery = InfoCardQueryService.getSpecimenQuery(this.taxon.id, true);
    this.collectionSpecimenQuery = InfoCardQueryService.getSpecimenQuery(this.taxon.id, false);
    this.collectionId = undefined;
  }

  showDocument(event: any) {
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

  setCollectionId(event: any) {
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

  onLogin() {
    this.userService.redirectToLogin();
  }
}
