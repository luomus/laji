import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IFormField, VALUE_IGNORE } from '../../../model/excel';
import { ExcelToolService } from '../../../service/excel-tool.service';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

  namedPlaces$: Observable<string[]>;

  constructor(
    private excelToolService: ExcelToolService
  ) { }

  ngOnInit() {
    this.namedPlaces$ = this.excelToolService.getNamedPlacesList(this.formID).pipe(
      map(places => [VALUE_IGNORE, ...places]),
      share()
    );
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
