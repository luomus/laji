import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';


@Component({
  selector: 'laji-gathering-annotation',
  templateUrl: './gathering-annotation.component.html',
  styleUrls: ['./gathering-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class GatheringAnnotationComponent {

  @Input() editors: string[];
  @Input() personID: string;
  @Input() documentID: string;
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


  constructor() { }


}

