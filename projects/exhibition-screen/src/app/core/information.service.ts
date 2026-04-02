import { Injectable } from '@angular/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Information } from 'projects/laji/src/app/shared/model/Information';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class InformationService {
  private informationCache: { [id: string]: Information } = {};

  constructor(
    private api: LajiApiClientBService
  ) {}

  getInformation(id: string): Observable<Information> {
    if (this.informationCache[id]) {
      return of(this.informationCache[id]);
    }
    return this.api.get('/information/{id}', { path: { id } }).pipe(
      tap(result => this.informationCache[id] = result)
    );
  }
}
