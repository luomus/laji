import { ChangeDetectionStrategy, Component, EventEmitter,
  Input, Output, OnInit, OnDestroy} from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { Subject } from 'rxjs';
import { TaxonTagEffectiveService } from '../../../shared-modules/document-viewer/taxon-tag-effective.service';


@Component({
  selector: 'laji-gathering-annotation',
  templateUrl: './gathering-annotation.component.html',
  styleUrls: ['./gathering-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringAnnotationComponent implements OnInit, OnDestroy {

  @Input() editors: string[];
  @Input() personID: string;
  @Input() personRoleAnnotation: Annotation.AnnotationRoleEnum;
  @Input() documentID: string;
  @Input() createdDate: any;
  @Input() loadDate: string;
  @Input() collectionId: string;
  @Input() observerId: string;
  @Input() gathering: any;
  @Input() highlight: string;
  @Input() visible = true;
  @Input() showFacts = false;
  @Input() unitCnt: number;
  @Input() identifying: boolean;
  @Input() openAnnotation: boolean;
  @Input() showOnlyHighlightedUnit: boolean;
  @Input() showAnnotation: boolean;
  @Output() showAllUnits = new EventEmitter();

  pendingAnnotation: boolean;
  parentSubject: Subject<boolean> = new Subject();

  constructor(private taxonTagEffective: TaxonTagEffectiveService) { }

  ngOnInit() {
    console.log('gathering-annotation');
  }


  checkPending(value: boolean) {
   this.pendingAnnotation = value;
   this.taxonTagEffective.emitChildEvent(value);
  }

  ngOnDestroy() {
    this.taxonTagEffective.emitChildEvent(false);
  }

}

