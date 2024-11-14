import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Document } from '../../../../shared/model/Document';
import { ViewerMapComponent } from '../../viewer-map/viewer-map.component';
import { SessionStorage } from 'ngx-webstorage';
import { DocumentPermissionService, DocumentRights } from '../../service/document-permission.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-document-local-viewer-view',
  templateUrl: './document-local-viewer-view.component.html',
  styleUrls: ['./document-local-viewer-view.component.css']
})
export class DocumentLocalViewerViewComponent implements OnChanges {
  @ViewChild(ViewerMapComponent) map?: ViewerMapComponent;

  @Input() document?: Document;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};
  @Input() useWorldMap = true;
  @Input() zoomToData? = false;

  @Output() documentDeleted = new EventEmitter();

  publicity = Document.PublicityRestrictionsEnum;
  active = 0;

  rights$!: Observable<DocumentRights>;

  @SessionStorage() showFacts = false;

  constructor(
    private documentPermissionService: DocumentPermissionService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.document) {
      this.rights$ = this.documentPermissionService.getRightsToLocalDocument(this.document);
      this.setActive(0);
      this.cd.markForCheck();
    }
  }

  setActive(i: number) {
    this.active = i;
    if (this.map) {
      this.map.setActiveIndex(i);
    }
  }

  onDocumentDeleted(e: string) {
    if (e) {
      this.documentDeleted.emit();
    }
  }

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }
}
