import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'laji-gathering',
  templateUrl: './gathering.component.html',
  styleUrls: ['./gathering.component.css']
})
export class GatheringComponent {

  @Input() gathering: any;
  @Input() highlight: string;
  @Input() visible = true;
  @Input() showFacts = false;

  constructor() { }

}
