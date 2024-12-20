import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-gathering',
  templateUrl: './gathering.component.html',
  styleUrls: ['./gathering.component.scss']
})
export class GatheringComponent {

  @Input() gathering: any;
  @Input() highlight?: string;
  @Input() visible = true;

}
