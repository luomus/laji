import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class RouterChildrenEventService {
  private showViewerClick = new Subject<any>();

  showViewerClick$ = this.showViewerClick.asObservable();

  showViewerClicked(docId: any) {
    this.showViewerClick.next(docId);
  }
}
