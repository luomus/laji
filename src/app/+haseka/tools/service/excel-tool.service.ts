import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { FormService } from '../../../shared/service/form.service';
import { Form } from '../../../shared/model/Form';
import { NamedPlacesService } from '../../../shared-modules/named-place/named-places.service';
import { UserService } from '../../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CombineToDocument } from './import.service';
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
    const usersNS$ = this.namedPlacesService.getAllNamePlaces({
      userToken: this.userService.getToken(),
      includePublic: false
    }).pipe(map(namedPlaces => namedPlaces.map(namedPlace => `${namedPlace.name} (${namedPlace.id})`)));

    const collection$ = (form: any) => {
      const selected = ((form.options || {}).namedPlaceList || []);
      return this.namedPlacesService.getAllNamePlaces({
        collectionID: form.collectionID,
        includeUnits: form.namedPlaceOptions && form.namedPlaceOptions.includeUnits,
        selectedFields: selected.map(field => field.replace('$.', ''))
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
      switchMap(form => FormService.hasFeature(form, Form.Feature.NamedPlace) ? collection$(form) : usersNS$),
      map(places => places.sort())
    );
  }

  getCombineOptions(form: any): CombineToDocument[] {
    if (form && form.schema && form.schema.properties && form.schema.properties && form.schema.properties.gatherings) {
      if (form.schema.properties.gatherings.items &&
        form.schema.properties.gatherings.items.properties && form.schema.properties.gatherings.items.properties.units &&
        form.schema.properties.gatherings.items.properties.units.maxItems === 1) {
        return [
          CombineToDocument.none
        ];
      } else if (form.schema.properties.gatherings.maxItems === 1) {
        return [
          CombineToDocument.gathering,
          CombineToDocument.none
        ];
      }
    }
    return [
      CombineToDocument.gathering,
      CombineToDocument.all,
      CombineToDocument.none
    ];
  }

}
