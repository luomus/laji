import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.css']
})
export class AnnotationListComponent implements OnInit {

  @Input() annotations: Annotation[];
  @Input() personID: string;
  @Output() remove = new EventEmitter<Annotation>();

  annotationTagsObservation = Global.annotationTags;

  types = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;
  changingLocale = false;

  constructor() { }

  ngOnInit() {
  }


}
