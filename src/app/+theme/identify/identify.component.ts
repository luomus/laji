import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SourceService } from '../../shared/service/source.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { environment } from '../../../environments/environment.vir';
import { TranslateService } from '@ngx-translate/core';
import { Global } from '../../../environments/global';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';

@Component({
  selector: 'laji-identify',
  templateUrl: './identify.component.html',
  styleUrls: ['./identify.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentifyComponent implements OnInit {

  query: WarehouseQueryInterface;
  group: string;
  documentId: string;
  unitId: string;

  formId: string;

  constructor(
    public translateService: TranslateService,
    private sourceService: SourceService,
    private cd: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  ngOnInit() {
    this.formId = environment.whichSpeciesForm;
    this.sourceService.getAllAsLookUp().pipe(
      map(sources => Object.keys(sources).filter((source) => source !== Global.sources.kotka)))
      .subscribe(sources => {
        this.query = {
          sourceId: sources,
          unidentified: true,
          countryId: ['ML.206'],
          informalTaxonGroupIdIncludingReported: this.group ? [this.group] : []
        };
        this.cd.markForCheck();
      });
  }

  onSelectGroup() {
    this.query = {
      ...this.query,
      informalTaxonGroupIdIncludingReported: [this.group]
    };
  }

  onImageSelect(event) {
    this.documentViewerFacade.showDocumentID({
      document: event.documentId,
      highlight: event.unitId,
      identifying: true,
      result: undefined
    });
  }

}
