import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { interval as ObservableInterval, Subscription } from 'rxjs';
import { IdService } from '../../../shared/service/id.service';
import { UserService } from '../../../shared/service/user.service';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-document-print',
  templateUrl: './document-print.component.html',
  styleUrls: ['../styles/document-print.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentPrintComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() uri: string;
  @Input() own: boolean;
  @Input() showFacts = false;

  externalViewUrl: string;
  document: any;
  documentID: string;
  hasDoc: boolean;

  mapData: any = [];

  isViewInited = false;

  private readonly recheckIterval = 10000; // check every 10sec if document not found
  private interval: Subscription;

  constructor(
    private warehouseApi: WarehouseApi,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private appRef: ApplicationRef
  ) { }

  ngAfterViewInit() {
    this.isViewInited = true;
    this.updateDocument();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.uri || changes.own) && this.isViewInited) {
      this.updateDocument();
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      this.interval.unsubscribe();
    }
  }

  updateDocument() {
    if (!this.uri) {
      return;
    }
    const findDox$ = this.warehouseApi
      .warehouseQuerySingleGet(this.uri, this.own ? {
        editorOrObserverPersonToken: this.userService.getToken()
      } : undefined)
      .pipe(map(doc => doc.document));
    findDox$
      .subscribe(
        doc => this.parseDoc(doc, true),
        err => this.parseDoc(undefined, false)
      );
  }

  private parseDoc(doc, found) {
    this.hasDoc = found;
    if (found) {
      this.document = doc;
      const mapData = [];
      this.externalViewUrl = Global.externalViewers[doc.sourceId] ?
        Global.externalViewers[doc.sourceId].replace('%uri%', doc.documentId) : '';
      if (doc.documentId) {
        this.documentID = IdService.getId(doc.documentId);
      }
      if (doc && doc.gatherings) {
        doc.gatherings.map((gathering, idx) => {
          if (gathering.conversions && gathering.conversions.wgs84Geo) {
            mapData[idx] = gathering.conversions.wgs84Geo;
          }
        });
      }
      this.mapData = mapData;
      if (this.interval) {
        this.interval.unsubscribe();
      }
    } else if (!this.interval) {
      this.interval = this.appRef.isStable.pipe(
        filter(stable => stable),
        take(1),
        switchMap(() => ObservableInterval(this.recheckIterval))
      ).subscribe(() => this.updateDocument());
    }
    this.cd.markForCheck();
  }

}
