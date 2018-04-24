import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormField, VALUE_IGNORE} from '../../../model/form-field';
import {NamedPlacesService} from '../../../../../shared-modules/named-place/named-places.service';
import {UserService} from '../../../../../shared/service';
import {MappingService} from '../../../service/mapping.service';

@Component({
  selector: 'laji-special-named-places',
  templateUrl: './special-named-places.component.html',
  styleUrls: ['./special-named-places.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecialNamedPlacesComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: FormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  namedPlaces: string[];

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private namedPlacesService: NamedPlacesService,
    private mappingService: MappingService
  ) { }

  ngOnInit() {
    this.namedPlacesService.getAllNamePlaces({
      userToken: this.userService.getToken(),
      includePublic: false
    })
      .map(namedPlaces => namedPlaces.map(namedPlace => `${namedPlace.name} (${namedPlace.id})`))
      .subscribe(places => {
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

}
