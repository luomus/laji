import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-occurrence-at-time-of-annotation',
  templateUrl: './occurrence-at-time-of-annotation.component.html',
  styleUrls: ['./occurrence-at-time-of-annotation.component.scss']
})
export class OccurrenceAtTimeOfAnnotationComponent {

  @Input() occurrence: any;
  @Input() hideTooltips = false;

  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }

}
