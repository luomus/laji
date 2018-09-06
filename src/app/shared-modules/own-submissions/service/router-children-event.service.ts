import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Document } from '../../../shared/model/Document';

@Injectable()
export class RouterChildrenEventService {
  private showViewerClick = new Subject<any>();

  showViewerClick$ = this.showViewerClick.asObservable();

  showViewerClicked(doc: Document) {
    this.showViewerClick.next(doc);
  }
}
