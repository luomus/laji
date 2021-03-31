import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-annotation-item-status',
  templateUrl: './annotation-item-status.component.html',
  styleUrls: ['./annotation-item-status.component.scss']
})
export class AnnotationItemStatusComponent {

  @Input() interpretation: any;
  @Input() text: boolean;
}
