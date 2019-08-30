import { Component, OnInit, Input, EventEmitter,
Output, NgZone } from '@angular/core';

@Component({
  selector: 'laji-annotation-item',
  templateUrl: './annotation-item.component.html',
  styleUrls: ['./annotation-item.component.scss']
})
export class AnnotationItemComponent implements OnInit {

  @Input() item: any;


  constructor(
    private zone: NgZone,
  ) { }

  ngOnInit() {
  }


}
