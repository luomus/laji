import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class RouterChildrenEventsService {
  private showViewerClick = new Subject<any>();

  showViewerClicked$ = this.showViewerClick.asObservable();

  showViewer(docId: any) {
    this.showViewerClick.next(docId);
  }
}
