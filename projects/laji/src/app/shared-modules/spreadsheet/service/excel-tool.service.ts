import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { FormService } from '../../../shared/service/form.service';
import { NamedPlacesService } from '../../../shared/service/named-places.service';
import { UserService } from '../../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CombineToDocument } from './import.service';
import { Form } from '../../../shared/model/Form';

const { JSONPath } = require('jsonpath-plus');

@Injectable({
  providedIn: 'root'
})
export class ExcelToolService {

  constructor(
    private namedPlacesService: NamedPlacesService,
    private userService: UserService,
    private formService: FormService,
    private translateService: TranslateService
  ) {}


  getNamedPlacesList(formID: string): Observable<string[]> {
    this.namedPlacesService.invalidateCache();
    const usersNS$ = this.namedPlacesService.getAllNamePlaces({
      userToken: this.userService.getToken(),
      includePublic: false
    }).pipe(map(namedPlaces => namedPlaces.map(namedPlace => `${namedPlace.name} (${namedPlace.id})`)));

    const collection$ = (form: Form.SchemaForm) => {
      const selected = form.options?.namedPlaceOptions?.listColumns || [];
      return this.namedPlacesService.getAllNamePlaces({
        collectionID: form.collectionID,
        includeUnits: form.options?.namedPlaceOptions?.includeUnits,
        selectedFields: selected.map(field => field.replace('$.', '')).join(',')
      }, selected).pipe(
        map(namedPlaces => namedPlaces.map(np => {
          const values = selected.reduce((cumulative, current) => {
            const value = JSONPath({json: np, path: current, wrap: false, flatten: true});
            if (typeof value !== 'undefined') {
              cumulative.push(Array.isArray(value) ? value.join(', ') : value);
            }
            return cumulative;
          }, []);
          const last = Math.max(values.length - 1, 0);
          values[last] = values[last] + ' (' + np.id + ')';
          return values.join(' | ');
        }))
      );
    };

    return this.formService.getForm(formID, this.translateService.currentLang).pipe(
      switchMap(form => form.options?.useNamedPlaces ? collection$(form) : usersNS$),
      map(places => places.sort())
    );
  }

  getCombineOptions(form: Form.SchemaForm): CombineToDocument[] {
    const {gatherings} = form?.schema?.properties;
    if (gatherings?.items?.properties?.units?.maxItems === 1) {
      return [
        CombineToDocument.none
      ];
    } else if (gatherings?.maxItems === 1) {
      return [
        CombineToDocument.gathering,
        CombineToDocument.none
      ];
    }
    return [
      CombineToDocument.gathering,
      CombineToDocument.all,
      CombineToDocument.none
    ];
  }

}
