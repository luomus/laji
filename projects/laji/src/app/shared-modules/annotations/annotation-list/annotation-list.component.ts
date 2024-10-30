import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { WarehousePipe } from '../../../shared/pipe/warehouse.pipe';


@Component({
  selector: 'laji-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.scss'],
  providers: [WarehousePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationListComponent implements OnInit, OnDestroy, OnChanges {

  @Input({ required: true }) annotations!: Annotation[];
  @Input() personID?: string;
  @Input() showLinks = true;
  @Input() lastAnnotationAddedId?: string;
  @Input() effectiveTags?: Annotation[];
  @Input() annotationTags?: AnnotationTag[];
  @Output() remove = new EventEmitter<Annotation>();

  types = Annotation.TypeEnum;
  lastFalse?: number;
  hasNextTrue?: boolean;
  open?: boolean[] = undefined;
  showItem?: boolean[];
  tagsConverted: any = {};

  ngOnInit() {
    (this.annotationTags || []).forEach(element => {
      const key = element.id;
      const obj: Record<string, AnnotationTag> = {};
      obj[key] = element;
      this.tagsConverted = Object.assign(this.tagsConverted, obj);
    });
  }

  ngOnChanges() {
    this.lastFalse = this.findLastIndex(this.annotations.reverse(), 'valid', false);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.hasNextTrue = this.annotations.reverse()[this.lastFalse! + 1] && this.annotations.reverse()[this.lastFalse! + 1].valid;
    this.open = [...Array(this.annotations.length)].fill(false);
    this.populateArrayShowItem(this.annotations);
  }

  toggleAnnotation(index: number) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.showItem![index] = !this.showItem![index];
  }

  readMore(index: number) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.open![index] = !this.open![index];
  }

  ngOnDestroy() {
    this.open = [...Array(this.annotations.length)].fill(false);
    this.populateArrayShowItem(this.annotations);
  }

  populateArrayShowItem(array: Annotation[]) {
    const showItem: boolean[] = [];
    array.forEach(element => {
      if (element['deleted'] || !element['valid']) {
        showItem.push(false);
      } else {
        showItem.push(true);
      }
    });
    this.showItem = showItem;
  }

  findLastIndex(annotation: Annotation[], field: keyof Annotation, value: any) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    annotation.sort((a, b) => (a.created! > b.created!) ? 1 : -1);
    const index = annotation.slice().reverse().findIndex(x => (x[field] === value && x['deleted'] === false));
    const count = annotation.length - 1;
    return index >= 0 ? count - index : index;
  }


}
