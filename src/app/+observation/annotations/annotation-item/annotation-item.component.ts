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

  annotationTagsObservation = Global.annotationTags;
  limit = 1;


  constructor(
    private zone: NgZone,
  ) { }

  ngOnInit() {
  }

  toggleLimit(e) {
    e.stopPropagation();
    if (this.item.unit.interpretations && this.item.unit.interpretations.effectiveTags && this.item.unit.interpretations.effectiveTags.length > 0) {
      if (this.limit === 1) {
        this.limit = this.item.unit.interpretations.effectiveTags.length - 1;
      } else {
        this.limit = 1;
      }
    } else {
      this.limit = 2;
    }
  }


}
