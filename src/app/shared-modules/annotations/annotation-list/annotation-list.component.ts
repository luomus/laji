import { Component, EventEmitter, Input, Output, OnDestroy, OnChanges,
ChangeDetectionStrategy, OnInit, ChangeDetectorRef} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Annotation } from '../../../shared/model/Annotation';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.css'],
  animations: [
    trigger('flyInOut', [
      transition('void => *', [
        style({display: 'none'}),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({display: 'block'}))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationListComponent implements OnInit, OnDestroy, OnChanges {

  @Input() annotations: Annotation[];
  @Input() personID: string;
  @Input() showLinks = true;
  @Input() lastAnnotationAddedId: string;
  @Input() effectiveTags: Annotation[];
  @Output() remove = new EventEmitter<Annotation>();

  annotationTagsObservation = Global.annotationTags;

  types = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;
  changingLocale = false;
  lastFalse: number;
  hasNextTrue: boolean;
  open: boolean[] = undefined;
  showItem: boolean[];

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.lastFalse = this.findLastIndex(this.annotations.reverse(), 'valid', false);
    if (this.annotations.reverse()[this.lastFalse + 1] && this.annotations.reverse()[this.lastFalse + 1].valid) {
      this.hasNextTrue = true;
    } else {
      this.hasNextTrue = false;
    }
    this.open = [...Array(this.annotations.length)].fill(false);
    this.populateArrayShowItem(this.annotations);
  }

  toggleAnnotation(index) {
    this.showItem[index] = !this.showItem[index];
  }

  readMore(index) {
    this.open[index] = !this.open[index];
  }

  ngOnDestroy() {
    this.open = [...Array(this.annotations.length)].fill(false);
    this.populateArrayShowItem(this.annotations);
  }


  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }


  populateArrayShowItem(array) {
    this.showItem = [];
    array.forEach(element => {
      if (element['deleted']) {
        this.showItem.push(false);
      } else {
        this.showItem.push(true);
      }
    });
  }

  findLastIndex(annotation, field, value) {
    annotation.sort((a, b) => (a.created > b.created) ? 1 : -1);
    const index = annotation.slice().reverse().findIndex(x => (x[field] === value && !x['deleted']));
    const count = annotation.length - 1;
    const finalIndex = index >= 0 ? count - index : index;
    return finalIndex;
  }


}
