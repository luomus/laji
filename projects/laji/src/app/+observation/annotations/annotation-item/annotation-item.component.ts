import { Component, OnInit, Input } from '@angular/core';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';


@Component({
  selector: 'laji-annotation-item',
  templateUrl: './annotation-item.component.html',
  styleUrls: ['./annotation-item.component.scss']
})
export class AnnotationItemComponent implements OnInit {

  @Input() item: any;
  @Input() annotationTags: AnnotationTag[];

  limit = 1;
  moreTags: number;
  tagsConverted: Object = {};


  constructor() { }

  ngOnInit() {
    if (this.item.unit.interpretations && this.item.unit.interpretations.effectiveTags && this.item.unit.interpretations.effectiveTags.length > 0) {
      this.moreTags = this.item.unit.interpretations.effectiveTags.length - 2;
    }
    (this.annotationTags || []).forEach(element => {
      const key = element.id;
      const obj = {};
      obj[key] = element;
      this.tagsConverted = Object.assign(this.tagsConverted, obj);
    });

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
