import { map, switchMap, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IFormField, VALUE_IGNORE } from '../../../model/excel';
import { NamedPlacesService } from '../../../../../shared-modules/named-place/named-places.service';
import { UserService } from '../../../../../shared/service/user.service';
import { FormService } from '../../../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Form } from '../../../../../shared/model/Form';
const { JSONPath } = require('jsonpath-plus');

@Component({
  selector: 'laji-special-named-places',
  templateUrl: './special-named-places.component.html',
  styleUrls: ['./special-named-places.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecialNamedPlacesComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: IFormField;
  @Input() formID: string;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  namedPlaces: string[];

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private namedPlacesService: NamedPlacesService,
    private formService: FormService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
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

    this.formService.getForm(this.formID, this.translateService.currentLang).pipe(
      switchMap(form => this.hasNSFeature(form) ? collection$(form) : usersNS$)
    ).subscribe(places => {
        places.sort();
        this.namedPlaces = [VALUE_IGNORE, ...places];
        this.cdr.markForCheck();
      });
  }

  valueMapped(value, to) {
    const mapping = {...this.mapping};

    if (to === undefined && mapping[value]) {
      delete mapping[value];
    } else {
      mapping[value] = to;
    }
    this.mappingChanged.emit(mapping);
  }

  private hasNSFeature(form: any): boolean {
    return form.features && form.features.indexOf(Form.Feature.NamedPlace) !== -1;
  }

}
