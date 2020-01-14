import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.css']
})
export class AnnotationListComponent implements OnInit, OnDestroy {

  @Input() annotations: Annotation[];
  @Input() personID: string;
  @Input() showLinks = true;
  @Output() remove = new EventEmitter<Annotation>();

  annotationTagsObservation = Global.annotationTags;

  types = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;
  changingLocale = false;
  open: boolean[] = undefined;

  constructor() { }

  ngOnInit() {
    this.open = [...Array(this.annotations.length)].fill(false);
  }

  readMore(index) {
    this.open[index] = !this.open[index];
  }

  ngOnDestroy() {
    this.open = [...Array(this.annotations.length)].fill(false);
  }


  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }


}
