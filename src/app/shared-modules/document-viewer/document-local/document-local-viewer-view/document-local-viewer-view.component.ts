import { Component, OnInit, OnDestroy, OnChanges, Input, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Document } from '../../../../shared/model/Document';
import { ViewerMapComponent } from '../../viewer-map/viewer-map.component';
import { SessionStorage } from 'ngx-webstorage';
import { Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../shared/service/user.service';

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

  publicity = Document.PublicityRestrictionsEnum;

  personID: string;
  active = 0;
  @SessionStorage() showFacts = false;

  private metaFetch: Subscription;

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.metaFetch = this.userService.action$
      .pipe(
        startWith(''),
        switchMap(() => this.userService.getUser())
      )
      .subscribe(person => {
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

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }
}
