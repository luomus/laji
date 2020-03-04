import { Component, EventEmitter, Input, Output, OnDestroy, OnChanges,
ChangeDetectionStrategy} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Annotation } from '../../../shared/model/Annotation';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.css'],
  animations: [
    trigger('newAnnotation', [
      state('last',
      style({backgroundColor: '#F1F1F1'})),
      transition('* => last', [
        animate('1.5s ease-out', style({ backgroundColor: '#fdfeb2c4' })),
        animate('0.5s ease-out', style({ backgroundColor: '#F1F1F1' })),
      ]),
    ])
  ],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationListComponent implements OnDestroy, OnChanges {

  @Input() annotations: Annotation[];
  @Input() personID: string;
  @Input() showLinks = true;
  @Input() lastAnnotationAddedId: string;
  @Output() remove = new EventEmitter<Annotation>();

  annotationTagsObservation = Global.annotationTags;

  types = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;
  changingLocale = false;
  lastFalse: number;
  open: boolean[] = undefined;

  constructor() { }

  ngOnChanges() {
    this.lastFalse = this.findLastIndex(this.annotations.reverse(), 'valid', false);
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
    annotation.sort((a, b) => (a.created > b.created) ? 1 : -1);
    const index = annotation.slice().reverse().findIndex(x => x[field] === value);
    const count = annotation.length - 1;
    const finalIndex = index >= 0 ? count - index : index;
    return finalIndex;
  }


}
