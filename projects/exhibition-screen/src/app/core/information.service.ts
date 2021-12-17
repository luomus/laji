import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LajiApi } from "projects/laji/src/app/shared/service/laji-api.service";
import { Information } from "projects/laji/src/app/shared/model/Information";
import { Observable, of } from "rxjs";
import { environment } from "projects/exhibition-screen/src/env/environment";
import { tap } from "rxjs/operators";
import { Util } from "projects/laji/src/app/shared/service/util.service";

@Injectable({providedIn: 'root'})
export class InformationService {
  private informationCache: { [id: string]: Information } = {};

  constructor(private httpClient: HttpClient) {}
  getInformation(id: string, query: LajiApi.Query.InformationQuery): Observable<Information> {
    if (this.informationCache[id]) {
      return of(this.informationCache[id]);
    }
    const url = `${environment.apiBase}/${LajiApi.Endpoints.information}/${id}`;
    const options = { params: {...Util.removeUndefinedFromObject(query)} };
    return this.httpClient.get<Information>(url, options).pipe(
      tap(result => this.informationCache[id] = result)
    );
  }
}
