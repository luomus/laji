import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output,
OnInit, OnDestroy} from '@angular/core';
import { TaxonTagEffectiveService } from '../taxon-tag-effective.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';

@Component({
  selector: 'laji-gathering',
  templateUrl: './gathering.component.html',
  styleUrls: ['./gathering.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringComponent implements OnInit, OnDestroy {

  @Input() documentID?: string;
  @Input() gathering: any;
  @Input() highlight?: string;
  @Input() highlightParents: string[] = [];
  @Input() visible = true;
  @Input() showFacts = false;
  @Input() unitCnt?: number;
  @Input() identifying: boolean;
  @Input() openAnnotation: boolean;
  @Input() showAnnotation: boolean;
  @Input() showOnlyHighlighted: boolean;
  @Input() annotationTags?: AnnotationTag[]|null;
  @Output() showAllUnits = new EventEmitter();


  constructor(private taxonTagEffective: TaxonTagEffectiveService) { }

  ngOnInit() {}

  ngOnDestroy() {
    this.taxonTagEffective.emitChildEvent(false);
  }

}
