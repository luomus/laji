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
  @Input() collectionId: string;
  @Input() editButtonVisible: boolean;
  @Input() editMode: boolean;

  @Output() onEditButtonClick = new EventEmitter();

  fields: any;

  keys: any;
  values: any;

  constructor() { }

  ngOnInit() {
    this.updateFields();
  }

  ngOnChanges() {
    this.updateFields();
  }

  editClick() {
    this.onEditButtonClick.emit();
  }

  private updateFields() {
    this.keys = [];
    this.values = {};
    this.fields = this.formData.schema.properties.namedPlace.items.properties;

    const displayedById =
      this.formData.uiSchema.namedPlace.uiSchema.items.placeWrapper['ui:options'].fieldScopes.collectionID;
    const displayed = displayedById[this.collectionId] ? displayedById[this.collectionId] : displayedById['*'];

    let gData = null;
    const np = this.namedPlace;

    if (np.prepopulatedDocument && np.prepopulatedDocument.gatherings && np.prepopulatedDocument.gatherings.length >= 0) {
      gData = np.prepopulatedDocument.gatherings[0];
    }

    for (const field in this.fields) {
      if (displayed.fields.indexOf(field) > -1 && (this.namedPlace[field] !== undefined || (gData && gData[field] !== undefined))) {
        this.keys.push(field);
        if (this.namedPlace[field] !== undefined) {
          this.values[field] = this.namedPlace[field];
        } else {
          this.values[field] = gData[field];
        }
      }
    }
  }
}
