import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SourceService } from '../../shared/service/source.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { environment } from '../../../environments/environment.vir';
import { ModalDirective } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-identify',
  templateUrl: './identify.component.html',
  styleUrls: ['./identify.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentifyComponent implements OnInit {

  @ViewChild('documentModal') public modal: ModalDirective;
  query: WarehouseQueryInterface;
  group: string;
  documentId: string;
  unitId: string;

  constructor(
    public translateService: TranslateService,
    private sourceService: SourceService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.modal.config = {animated: false};
    this.sourceService.getAllAsLookUp()
      .map(sources => Object.keys(sources).filter((source) => source !== environment.sources.kotka))
      .subscribe(sources => {
        this.query = {
          sourceId: sources,
          unidentified: true,
          countryId: ['ML.206'],
          informalTaxonGroupId: this.group ? [this.group] : []
        };
        this.cd.markForCheck();
      });
  }

  onSelectGroup() {
    this.query = {
      ...this.query,
      informalTaxonGroupId: [this.group]
    };
  }

  onImageSelect(event) {
    this.documentId = event.documentId;
    this.unitId = event.unitId;
    this.modal.show();
  }

}
