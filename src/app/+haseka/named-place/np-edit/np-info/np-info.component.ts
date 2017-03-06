import { Component, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-info',
  templateUrl: './np-info.component.html',
  styleUrls: ['./np-info.component.css']
})
export class NpInfoComponent implements OnInit, OnChanges {
  @Input() namedPlace: NamedPlace;
  @Input() formData: any;
  @Input() editButtonVisible: boolean;

  @Output() onEditButtonClick = new EventEmitter();

  hiddenProperties = ['geometry', 'geometryOnMap'];

  fields: any;
  npProperties: any;

  constructor() { }

  ngOnInit() {
    this.fields = this.formData.schema.properties.namedPlace.items.properties;
    this.npProperties = Object.keys(this.namedPlace);

    for (let i = 0; i < this.npProperties.length; i++) {
      const p = this.npProperties[i];
    }
  }

  ngOnChanges() {
    this.fields = this.formData.schema.properties.namedPlace.items.properties;
    this.npProperties = Object.keys(this.namedPlace);
  }

  editClick() {
    this.onEditButtonClick.emit();
  }
}
