import { Component, Input, OnInit } from '@angular/core';
import { ListType } from '../list.component';
import { FilterQuery } from '../../../iucn-shared/service/result.service';

@Component({
  selector: 'laji-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  @Input() type: ListType;
  @Input() query: FilterQuery;

  constructor() { }

  ngOnInit() {
  }

}
