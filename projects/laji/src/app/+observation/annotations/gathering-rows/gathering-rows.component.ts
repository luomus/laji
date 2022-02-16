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
