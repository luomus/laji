import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-gathering-rows',
  templateUrl: './gathering-rows.component.html',
  styleUrls: ['./gathering-rows.component.scss']
})
export class GatheringRowsComponent implements OnInit {
  @Input() gathering: any;

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
