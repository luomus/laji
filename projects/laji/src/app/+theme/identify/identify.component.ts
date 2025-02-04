import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SourceService } from '../../shared/service/source.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { TranslateService } from '@ngx-translate/core';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';
import { Global } from '../../../environments/global';
import { TaxonomyImage } from '../../shared/model/Taxonomy';
import { IImageSelectEvent } from '../../shared/gallery/image-gallery/image.interface';

@Component({
  selector: 'laji-identify',
  templateUrl: './identify.component.html',
  styleUrls: ['./identify.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentifyComponent implements OnInit {

  query?: WarehouseQueryInterface;
  group?: string;
  documentId?: string;
  unitId?: string;
  totalItemsIdentify?: TaxonomyImage[];
  formId?: string;

  constructor(
    public translateService: TranslateService,
    private sourceService: SourceService,
    private cd: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  ngOnInit() {
    this.formId = Global.forms.whichSpecies;
    this.query = {
          unidentified: true,
          informalTaxonGroupIdIncludingReported: this.group ? [this.group] : []
    };
  }

  onSelectGroup() {
    this.query = {
      ...this.query,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      informalTaxonGroupIdIncludingReported: [this.group!]
    };
  }

  onImageSelect(event: IImageSelectEvent) {
    this.documentViewerFacade.showDocumentID({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      document: event.documentId!,
      highlight: event.unitId,
      identifying: true,
      openAnnotation: true,
      result: this.totalItemsIdentify
    });
  }

  onImagesInit(e: TaxonomyImage[]) {
    this.totalItemsIdentify = e;
  }

}
