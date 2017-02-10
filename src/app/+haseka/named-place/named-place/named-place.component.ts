import { Component, OnDestroy, OnInit, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { NpMapComponent } from '../np-map/np-map.component';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlacesService } from '../named-places.service';
import { FormService } from '../../form/form.service';

@Component({
  selector: 'laji-named-place',
  templateUrl: './named-place.component.html',
  styleUrls: ['./named-place.component.css']
})
export class NamedPlaceComponent implements OnInit, OnDestroy, OnChanges {
  formId;
  collectionId;
  namedPlaces: NamedPlace[];
  activeNP: number = -1;
  private subParam: Subscription;

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
      const namedPlaces$ = this.namedPlaceService
        .getAllNamePlacesByCollectionId(this.collectionId)
        .map(result => result.results);

      namedPlaces$.subscribe(
        data => (this.namedPlaces = data)
      )
    }
  }

  setActiveNP(idx) {
    this.activeNP = idx;
  }

  populateForm() {
    const np = this.namedPlaces[this.activeNP];

    np.prepopulatedDocument ?
      this.formService.populate(np.prepopulatedDocument) :
      this.formService.populate({gatherings: [{geometry: {type: 'GeometryCollection', geometries: [np.geometry]}}]});
  }
}
