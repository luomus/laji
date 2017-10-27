import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-gathering',
  templateUrl: './gathering.component.html',
  styleUrls: ['./gathering.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringComponent {

  @Input() editors: string[];
  @Input() personID: string;
  @Input() documentID: string;
  @Input() gathering: any;
  @Input() highlight: string;
  @Input() visible = true;
  @Input() showFacts = false;
  @Input() unitCnt: number;
  @Input() openAnnotation: boolean;
  @Input() showOnlyHighlightedUnit: boolean;
  @Output() showAllUnits = new EventEmitter();

  constructor() { }

}
