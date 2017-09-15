import { Component, Input, OnInit } from '@angular/core';
import { MainResultService } from '../main-result.service';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { PagedResult } from '../../../shared/model/PagedResult';

@Component({
  selector: 'laji-observations-datatable',
  templateUrl: './observations-datatable.component.html',
  styleUrls: ['./observations-datatable.component.css']
})
export class ObservationsDatatableComponent implements OnInit {

  @Input() query: WarehouseQueryInterface;
  @Input() pageSize = 25;

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: this.pageSize
  };

  columns = [
    { name: 'unit.linkings.taxon.scientificName' },
    { name: 'gathering.eventDate' },
    { name: 'id' }
  ];

  allColumns = [
    { name: 'unit.linkings.taxon.scientificName' },
    { name: 'gathering.eventDate' },
    { name: 'id' }
  ];

  constructor(
    private resultService: MainResultService
  ) { }

  ngOnInit() {
    this.resultService.getList(this.query, 1, this.pageSize)
      .subscribe(data => this.result = data);
  }

}
