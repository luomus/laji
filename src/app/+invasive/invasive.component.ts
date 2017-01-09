import { Component, OnInit } from '@angular/core';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { Taxonomy } from '../shared/model/Taxonomy';
import { IdService } from '../shared/service/id.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-invasive',
  templateUrl: './invasive.component.html',
  styleUrls: ['./invasive.component.css']
})
export class InvasiveComponent implements OnInit {

  static taxa;

  public  dateFormat = 'YYYY-MM-DD';
  public taxa: Observable<Taxonomy[]>;
  public aggr: {[key: string]: number} = {};
  public daysBack = '365';

  constructor(
    private taxonomyApi: TaxonomyApi,
    private warehouseApi: WarehouseApi
  ) {
    this.daysBack = moment().subtract(365, 'days');
  }

  ngOnInit() {
    this.updateObservations();
    this.updateTaxa();
  }

  updateTaxa() {
    if (InvasiveComponent.taxa) {
      this.taxa = Observable.of(InvasiveComponent.taxa);
    } else {
      this.taxa = this.taxonomyApi
        .taxonomyFindSpecies('MX.37600', 'multi', undefined, 'MX.euInvasiveSpeciesList')
        .map(species => species.results)
        .do(taxa => InvasiveComponent.taxa = taxa);
    }
  }

  updateObservations() {
    this.warehouseApi.warehouseQueryAggregateGet(
      {
        countryId: ['ML.206'],
        administrativeStatusId: ['MX.euInvasiveSpeciesList']
      },
      ['unit.linkings.taxon.id'],
      undefined,
      undefined,
      undefined,
      undefined,
      false
    )
      .map(data => data.results)
      .subscribe(data => {
        data.map(item => {
          item.isNew = moment(item.oldestRecord) > this.daysBack;
          this.aggr[IdService.getId(item['aggregateBy']['unit.linkings.taxon.id'])] = item;
        });
      });
  }

}
