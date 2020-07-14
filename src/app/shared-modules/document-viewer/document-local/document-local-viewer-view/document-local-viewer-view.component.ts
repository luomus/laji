import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Document } from '../../../../shared/model/Document';
import { ViewerMapComponent } from '../../viewer-map/viewer-map.component';
import { SessionStorage } from 'ngx-webstorage';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../shared/service/user.service';
import { Router, RouterModule } from '@angular/router';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';

@Component({
  selector: 'laji-document-local-viewer-view',
  templateUrl: './document-local-viewer-view.component.html',
  styleUrls: ['./document-local-viewer-view.component.css']
})
export class DocumentLocalViewerViewComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(ViewerMapComponent) map: ViewerMapComponent;

  @Input() document: Document;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};
  @Input() useWorldMap = true;
  @Input() zoomToData = false;

  publicity = Document.PublicityRestrictionsEnum;

  personID: string;
  active = 0;
  @SessionStorage() showFacts = false;

  private metaFetch: Subscription;

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) { }

  ngOnInit() {
    this.metaFetch = this.userService.user$.subscribe(person => {
        this.personID = person.id;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    this.metaFetch.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.document) {
      this.setActive(0);
    }
  }

  setActive(i) {
    this.active = i;
    if (this.map) {
      this.map.setActiveIndex(i);
    }
  }

  onDocumentDeleted(e) {
    if (e) {
      this.router.navigate(
        this.localizeRouterService.translateRoute(['/vihko/ownSubmissions/'])
      );
    }
  }

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }
}
