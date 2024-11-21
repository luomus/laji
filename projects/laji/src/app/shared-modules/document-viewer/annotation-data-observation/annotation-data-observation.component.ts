import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'laji-annotation-data-observation',
  templateUrl: './annotation-data-observation.component.html',
  styleUrls: ['./annotation-data-observation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationDataObservationComponent implements OnInit {
  @Input() gathering: any;
  @Input() unit: any;
  @Input() createdDate: any;
  @Input() collectionId?: string;
  @Input() hideTooltips = false;

  occurrence: any;

  ngOnInit() {
    this.occurrence = this.unit.annotations[this.unit.annotations.length - 1].occurrenceAtTimeOfAnnotation;
  }

  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }

}
