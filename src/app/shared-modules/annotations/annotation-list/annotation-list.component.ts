import { Component, EventEmitter, Input, Output, OnDestroy, OnChanges,
ChangeDetectionStrategy} from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationListComponent implements OnDestroy, OnChanges {

  @Input() annotations: Annotation[];
  @Input() personID: string;
  @Input() showLinks = true;
  @Output() remove = new EventEmitter<Annotation>();

  annotationTagsObservation = Global.annotationTags;

  types = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;
  changingLocale = false;
  lastFalse: number;
  open: boolean[] = undefined;

  constructor() { }

  ngOnChanges() {
    this.lastFalse = this.findLastIndex(this.annotations, 'valid', false);
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

  findLastIndex(annotation, field, value) {
    const index = annotation.slice().reverse().findIndex(x => x[field] === value);
    const count = annotation.length - 1;
    const finalIndex = index >= 0 ? count - index : index;
    return finalIndex;
  }


}
