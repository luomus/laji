import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-gathering',
  templateUrl: './gathering.component.html',
  styleUrls: ['./gathering.component.css']
})
export class GatheringComponent {

  @Input() editors: string[];
  @Input() personID: string;
  @Input() documentID: string;
  @Input() gathering: any;
  @Input() highlight: string;
  @Input() visible = true;
  @Input() showFacts = false;

  constructor() { }

}
