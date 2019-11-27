import { Component, OnInit, Input } from '@angular/core';
import { Global } from '../../../../environments/global';


@Component({
  selector: 'laji-observation-effective-tags-taxon',
  templateUrl: './observation-effective-tags-taxon.component.html',
  styleUrls: ['./observation-effective-tags-taxon.component.scss']
})
export class ObservationEffectiveTagsTaxonComponent implements OnInit {

  @Input() unit: any;

  annotationTagsObservation = Global.annotationTags;

  constructor() { }

  ngOnInit() {
     this.unit.addedTags = [];
  }

}
