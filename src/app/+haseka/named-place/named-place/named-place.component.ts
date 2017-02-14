import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlacesService } from '../named-places.service';
import { FormService } from '../../form/form.service';
import {Observable} from "rxjs";

@Component({
  selector: 'laji-named-place',
  templateUrl: './named-place.component.html',
  styleUrls: ['./named-place.component.css']
})
export class NamedPlaceComponent implements OnInit {
  formId;
  collectionId;

  namedPlaces: NamedPlace[];
  activeNP: number = -1;

  private subParam: Subscription;
  private namedPlaces$: Observable<NamedPlace[]>;

  constructor(
    private route: ActivatedRoute,
    private namedPlaceService: NamedPlacesService,
    private formService: FormService
  ) {}

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.formId = params['formId'];
      this.collectionId = params['collectionId'];
    });

    this.updateNP();
  }

  ngOnChanges() {
    this.updateNP();
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
  }

  updateNP() {
    if (this.collectionId) {
      this.namedPlaces$ = this.namedPlaceService
        .getAllNamePlacesByCollectionId(this.collectionId)
        .map(result => result.results);

      this.namedPlaces$.subscribe(
        data => (this.namedPlaces = data)
      )
      /*this.namedPlaces = [
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
       ];*/
    }
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
  }

  populateForm() {
    const np = this.namedPlaces[this.activeNP];

    np.prepopulatedDocument ?
      this.formService.populate(np.prepopulatedDocument) :
      this.formService.populate({gatherings: [{geometry: {type: 'GeometryCollection', geometries: [np.geometry]}}]});
  }
}
