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
        const splitDateTime = this.gathering.displayDateTime.split(' ');
        this.date = splitDateTime[0];
        this.time = splitDateTime[1];
      } else {
        this.date = this.gathering.displayDateTime;
        this.time = '';
      }
    }
  }

}
