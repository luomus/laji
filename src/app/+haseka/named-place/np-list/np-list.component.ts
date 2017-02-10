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
  demo: NamedPlace[] = [
    {
      'id': 'MNP.65',
      'collectionID': 'HR.128',
      'geometry': {'type': 'Polygon', 'coordinates': [[
        [24.697265625, 62.955223045159],
        [26.3671875, 65.403444788308],
        [27.70751953125, 64.774125312929],
        [27.18017578125, 63.714454583648],
        [26.21337890625, 63.956673336488],
        [26.19140625, 63.636503596185],
        [27.18017578125, 63.064914202086],
        [27.13623046875, 62.34960927573],
        [25.2685546875, 62.000904713686],
        [23.97216796875, 62.288365098248],
        [24.697265625, 62.955223045159]
      ]]},
      'name': 'Visake alue #1',
      'priority': NamedPlace.PriorityEnum.Priority4,
      'public': true,
      'owners': ['MA.97']
    }
  ];

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
      this.namedPlaces$ = Observable.of(this.demo);
      /*
      this.namedPlaces$ = this.namedPlaceService
        .getAllNamePlacesByCollectionId(this.collectionId)
        .map(result => result.results);
      */
    }
  }

  populateForm(np: NamedPlace) {
    np.prepopulatedDocument ?
      this.formService.populate(np.prepopulatedDocument) :
      this.formService.populate({gatherings: [{geometry: {type: 'GeometryCollection', geometries: [np.geometry]}}]});
  }

}
