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

  date = '';
  time = '';

  ngOnInit() {
    if (this.gathering.displayDateTime) {
      if (this.gathering.displayDateTime.indexOf(' ') !== -1) {
        const split_date_time = this.gathering.displayDateTime.split(' ');
        this.date = split_date_time[0];
        this.time = split_date_time[1];
      } else {
        this.date = this.gathering.displayDateTime;
        this.time = '';
      }
    }
  }

}
