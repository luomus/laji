import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NamedPlacesService } from '../named-places.service';
import { Observable } from 'rxjs/Observable';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { FormService } from '../../form/form.service';

@Component({
  selector: 'laji-np-list',
  templateUrl: './np-list.component.html',
  styleUrls: ['./np-list.component.css']
})
export class NpListComponent implements OnInit, OnChanges {

  @Input() collectionId: string;
  @Input() formId: string;

  namedPlaces$: Observable<NamedPlace[]>;

  constructor(
    private namedPlaceService: NamedPlacesService,
    private formService: FormService
  ) { }

  ngOnInit() {
    this.updateNP();
  }

  ngOnChanges() {
    this.updateNP();
  }

  updateNP() {
    if (this.collectionId) {
      this.namedPlaces$ = this.namedPlaceService
        .getAllNamePlacesByCollectionId(this.collectionId)
        .map(result => result.results);
    }
  }

  populateForm(np: NamedPlace) {
    this.formService.populate({
      gatherings: [{
        geometry: {
          'type': 'GeometryCollection',
          'geometries': [
            np.geometry
          ]
        }
      }]
    });
  }

}
