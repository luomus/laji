import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { LajiMapOptions } from '../../../../../shared-modules/map/map-options.interface';
import { Map3Component } from '../../../../../shared-modules/map/map.component';

@Component({
  selector: 'laji-special-geometry',
  templateUrl: './special-geometry.component.html',
  styleUrls: ['./special-geometry.component.css']
})
export class SpecialGeometryComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();
  @ViewChild(Map3Component) lajiMap: Map3Component;

  lajiMapOptions: LajiMapOptions = {
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
        copy: false,
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
  active = 0;

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.lajiMap.invalidateSize();
    }, 500);
  }

}
