import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output,
  ViewChild
} from '@angular/core';
import { LajiMap } from '../../../../../shared-modules/laji-map/laji-map.interface';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import {FormField, VALUE_IGNORE} from '../../../model/form-field';
import {CoordinateService} from '../../../../../shared/service/coordinate.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-special-geometry',
  templateUrl: './special-geometry.component.html',
  styleUrls: ['./special-geometry.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SpecialGeometryComponent implements AfterViewInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: FormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();
  @Output() done = new EventEmitter();
  @ViewChild(LajiMapComponent) lajiMapComponent: LajiMapComponent;

  ignore = VALUE_IGNORE;
  lajiMapOptions: LajiMap.Options = {
    drawIdx: 0,
    draw: {
      marker: true,
      polyline: true,
      polygon: true,
      circle: true,
      rectangle: true
    },
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
      }
    }
  };
  active: number;
  last: number;
  value: any;

  constructor(
    private coordinateService: CoordinateService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.lajiMapOptions.lang = this.translateService.currentLang;
  }

  ngAfterViewInit() {
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
        featureCollection: this.coordinateService.getFeatureCollectionFromGeometry(this.mapping[this.value]),
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
    this.valueMap(this.value, this.coordinateService.getGeometryFromFeatureCollection(drawnData.featureCollection));
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
