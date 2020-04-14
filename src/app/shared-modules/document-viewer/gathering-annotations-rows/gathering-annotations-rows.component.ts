import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-gathering-annotations-rows',
  templateUrl: './gathering-annotations-rows.component.html',
  styleUrls: ['./gathering-annotations-rows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringAnnotationsRowsComponent implements OnInit {
  @Input() gathering: any;
  @Input() highlight: string;
  @Input() hideTooltips = false;

  constructor() { }

  ngOnInit() {
  }

}
