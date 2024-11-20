import { ChangeDetectionStrategy, Component, EventEmitter,
  Input, Output, OnDestroy} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Annotation } from '../../../shared/model/Annotation';
import { Subject, Subscription } from 'rxjs';
import { LoadingElementsService } from '../loading-elements.service';
import { TaxonTagEffectiveService } from '../taxon-tag-effective.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';


@Component({
  selector: 'laji-gathering-annotation',
  templateUrl: './gathering-annotation.component.html',
  styleUrls: ['./gathering-annotation.component.scss'],
  animations: [
      trigger('message', [
        transition(':leave', [
          style({opacity: 1}),
          animate('500ms', style({ opacity: 0}))
        ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringAnnotationComponent implements OnDestroy {

  @Input() isEditor?: boolean;
  @Input() personID?: string;
  @Input() personRoleAnnotation?: Annotation.AnnotationRoleEnum;
  @Input({ required: true }) documentID!: string;
  @Input() createdDate: any;
  @Input() loadDate?: string;
  @Input() collectionId?: string;
  @Input() observerId?: string;
  @Input() gathering: any;
  @Input() highlight?: string;
  @Input() visible = true;
  @Input() showFacts = false;
  @Input() unitCnt?: number;
  @Input() identifying?: boolean;
  @Input() openAnnotation?: boolean;
  @Input() showOnlyHighlightedUnit?: boolean;
  @Input() showAnnotation?: boolean;
  @Input() annotationTags?: AnnotationTag[]|null;
  @Output() showAllUnits = new EventEmitter();

  annotationAddedDeleted = {
    status: false,
    action: undefined
  };

  parentSubject: Subject<boolean> = new Subject();

  constructor(
    private loadingElements: LoadingElementsService,
    private taxonTagEffective: TaxonTagEffectiveService
    ) { }

  checkPending(value: any) {
   this.annotationAddedDeleted = value;
  }

  ngOnDestroy() {
    this.taxonTagEffective.emitChildEvent(false);
    this.loadingElements.emitChildEvent(false);
  }

}

