import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { IFormField, VALUE_IGNORE } from '../../../model/excel';
import { TranslateService } from '@ngx-translate/core';
import { LajiMapLang, LajiMapOptions } from '@laji-map/laji-map.interface';
import { getFeatureCollectionFromGeometry, getGeometryFromFeatureCollection } from 'projects/laji/src/app/root/coordinate-utils';

@Component({
  selector: 'laji-special-geometry',
  templateUrl: './special-geometry.component.html',
  styleUrls: ['./special-geometry.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SpecialGeometryComponent {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: IFormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();
  @Output() done = new EventEmitter();
  @ViewChild(LajiMapComponent) lajiMapComponent: LajiMapComponent<any>;

  ignore = VALUE_IGNORE;
  lajiMapOptions: LajiMapOptions = {
    draw: {
      marker: true,
      polyline: true,
      polygon: true,
      circle: true,
      rectangle: true,
      activeIdx: 0
    } as any,
    controls: {
      draw: {
        marker: true,
        polyline: true,
        polygon: true,
        circle: true,
        rectangle: true,
        copy: true,
        upload: true,
        undo: false,
        redo: false,
        clear: true,
        delete: true,
        reverse: false,
        coordinateInput: true
      } as any
    },
    lang: LajiMapLang.fi
  };
  active: number;
  last: number;
  value: any;

  constructor(
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.lajiMapOptions.lang = <LajiMapLang> this.translateService.currentLang;
  }

  onMapLoad() {
    setTimeout(() => {
      this.lajiMapComponent.invalidateSize();
      this.lajiMapComponent.map.setData([{}]);
      this.setActive(0);
      this.initLast();
      this.cdr.markForCheck();
    }, 200);
  }

  setActive(idx) {
    if (idx > this.last) {
      return this.done.emit();
    }
    this.active = idx;
    this.value = this.invalidValues[idx];
    if (this.mapping[this.value] && this.mapping[this.value] !== VALUE_IGNORE) {
      this.lajiMapComponent.map.setDraw({
        featureCollection: getFeatureCollectionFromGeometry(this.mapping[this.value]),
        onChange: this.onChange.bind(this)
      });
      this.lajiMapComponent.map.focusToDrawLayer(0);
    } else {
      this.lajiMapComponent.map.setDraw({
        featureCollection: undefined,
        onChange: this.onChange.bind(this)
      });
    }
  }

  onChange() {
    this.initLast();
    const drawnData = this.lajiMapComponent.map.getDraw();
    this.valueMap(this.value, getGeometryFromFeatureCollection(drawnData.featureCollection));
  }

  initLast() {
    this.last = this.invalidValues ? (this.invalidValues.length - 1) : 0;
  }

  valueMap(value, to) {
    const mapping = {...this.mapping};

    if (to === undefined && mapping[value]) {
      delete mapping[value];
    } else {
      to['coordinateVerbatim'] = value;
      mapping[value] = to;
    }
    this.mappingChanged.emit(mapping);
    this.cdr.markForCheck();
  }

}
