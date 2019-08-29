import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-gathering-rows',
  templateUrl: './gathering-rows.component.html',
  styleUrls: ['./gathering-rows.component.scss']
})
export class GatheringRowsComponent implements OnInit {
  @Input() gathering: any;

  constructor() { }

  ngOnInit() {
  }

}
