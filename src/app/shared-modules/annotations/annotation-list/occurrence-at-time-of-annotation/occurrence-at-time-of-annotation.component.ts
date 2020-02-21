import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-occurrence-at-time-of-annotation',
  templateUrl: './occurrence-at-time-of-annotation.component.html',
  styleUrls: ['./occurrence-at-time-of-annotation.component.scss']
})
export class OccurrenceAtTimeOfAnnotationComponent implements OnInit {

  @Input() occurrence: any;
  @Input() hideTooltips = false;

  constructor() { }

  ngOnInit() {
  }

  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }

}
