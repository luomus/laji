import { Component, OnInit, ViewChild } from '@angular/core';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { Taxonomy } from '../shared/model/Taxonomy';
import { IdService } from '../shared/service/id.service';
import { Observable } from 'rxjs/Observable';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';

@Component({
  selector: 'laji-invasive',
  templateUrl: './invasive.component.html',
  styleUrls: ['./invasive.component.css']
})
export class InvasiveComponent implements OnInit {

  static taxa;
  @ViewChild('documentModal') public modal: ModalDirective;

  taxa: Observable<Taxonomy[]>;
  aggr: {[key: string]: number} = {};
  daysBack;

  shownDocument = '';
  highlightId;

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
          item.isNewThisYear = moment(item.newestRecord) > this.daysBack;
          this.aggr[IdService.getId(item['aggregateBy']['unit.linkings.taxon.id'])] = item;
        });
      });
  }

  showLatestDocument(taxonID) {
    this.warehouseApi.warehouseQueryListGet({taxonId: taxonID}, ['document.documentId', 'unit.unitId'], undefined, 1)
      .map(data => data.results[0])
      .subscribe(result => {
        this.shownDocument = result.document && result.document.documentId || '';
        this.highlightId = result.unit && result.unit.unitId || '';
        this.modal.show();
      });
  }
}
