import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-info',
  templateUrl: './np-info.component.html',
  styleUrls: ['./np-info.component.css']
})
export class NpInfoComponent implements OnInit, OnChanges {
  @Input() namedPlace: NamedPlace;
  @Input() formData: any;

  fields: any;
  npProperties: any;

  constructor() { }

  ngOnInit() {
    this.fields = this.formData.schema.properties.namedPlace.items.properties;
    this.npProperties = Object.keys(this.namedPlace);
  }

  ngOnChanges() {
    this.fields = this.formData.schema.properties.namedPlace.items.properties;
    this.npProperties = Object.keys(this.namedPlace);
  }
}
