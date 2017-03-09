import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MapService {

  public mapUpdatedSource = new Subject<any>();
  public map$ = this.mapUpdatedSource.asObservable();

  constructor() { }

  public startDraw() {
    this.mapUpdatedSource.next('drawstart');
  }

  public stopDraw() {
    this.mapUpdatedSource.next('drawstop');
  }
}
