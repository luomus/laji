import { Injectable } from '@angular/core';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs';
import { components } from 'projects/laji-api-client/generated/api.d';

type Information = components['schemas']['Information'];

@Injectable({providedIn: 'root'})
export class InformationService {
  private informationCache: { [id: string]: Information } = {};

  constructor(
    private api: LajiApiClientService
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
