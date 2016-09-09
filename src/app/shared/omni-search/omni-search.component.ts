import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'laji-omni-search',
  templateUrl: 'omni-search.component.html',
  styleUrls: ['./omni-search.component.css' ]
})
export class OmniSearchComponent implements OnInit {

  @Input() placeholder:string;

  constructor() {
  }

  ngOnInit() {
  }

}
