import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-gathering-rows',
  templateUrl: './gathering-rows.component.html',
  styleUrls: ['./gathering-rows.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringRowsComponent implements OnInit {
  @Input() gathering: any;
  @Input() hideTooltips = false;

  constructor() { }

  ngOnInit() {
  }

}
