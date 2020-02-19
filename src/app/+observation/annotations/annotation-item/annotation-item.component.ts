import { Component, OnInit, Input, EventEmitter,
Output, NgZone } from '@angular/core';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-annotation-item',
  templateUrl: './annotation-item.component.html',
  styleUrls: ['./annotation-item.component.scss']
})
export class AnnotationItemComponent implements OnInit {

  @Input() item: any;
  // addedTags: Array<string>;

  addedTags = ['MMAN.3', 'MMAN.5', 'MMAN.22', 'MMAN.23'];
  annotationTagsObservation = Global.annotationTags;


  constructor(
    private zone: NgZone,
  ) { }

  ngOnInit() {
  }


}
