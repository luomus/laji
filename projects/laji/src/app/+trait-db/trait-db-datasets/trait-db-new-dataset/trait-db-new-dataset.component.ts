import { Component, OnInit } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type Dataset = components['schemas']['Dataset'];

@Component({
  templateUrl: './trait-db-new-dataset.component.html',
  styleUrls: ['./trait-db-new-dataset.component.scss']
})
export class TraitDbNewDatasetComponent implements OnInit {
  constructor(private api: LajiApiClientBService) {}

  ngOnInit() {}
}

