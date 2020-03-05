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
  @Input() editors: Array<string>;
  @Input() createdDate: any;
  @Input() collectionId: string;
  @Input() hideTooltips = false;

  constructor() { }

  ngOnInit() {
    console.log(this.unit)
  }

}
