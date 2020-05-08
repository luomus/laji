import { map, tap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { TaxonomyApi } from '../../../../../src/app/shared/api/TaxonomyApi';
import { WarehouseApi } from '../../../../../src/app/shared/api/WarehouseApi';
import { Taxonomy } from '../../../../../src/app/shared/model/Taxonomy';
import { IdService } from '../../../../../src/app/shared/service/id.service';
import { Observable, of as ObservableOf } from 'rxjs';
import * as moment from 'moment';
import { DocumentViewerFacade } from '../../../../../src/app/shared-modules/document-viewer/document-viewer.facade';

interface IAggregated {
  isNew: boolean;
  isNewThisYear: boolean;
  count: number;
  individualCountSum: number;
  oldestRecord: string;
  newestRecord: string;
}

@Component({
  selector: 'vir-invasive',
  templateUrl: './invasive.component.html',
  styleUrls: ['./invasive.component.css']
})
export class InvasiveComponent implements OnInit {

  static taxa;

  taxa: Observable<Taxonomy[]>;
  aggr: {[key: string]: IAggregated} = {};
  daysBack;
  invasiveQuery = {
    countryId: ['ML.206'],
    administrativeStatusId: ['MX.euInvasiveSpeciesList']
  };

  constructor(
    private taxonomyApi: TaxonomyApi,
    private warehouseApi: WarehouseApi,
    private documentViewerFacade: DocumentViewerFacade
  ) {
    this.daysBack = moment().subtract(365, 'days');
  }

  ngOnInit() {
    this.updateObservations();
    this.updateTaxa();
  }

  updateTaxa() {
    if (InvasiveComponent.taxa) {
      this.taxa = ObservableOf(InvasiveComponent.taxa);
    } else {
      this.taxa = this.taxonomyApi
        .taxonomyFindSpecies('MX.37600', 'multi', undefined, 'MX.euInvasiveSpeciesList').pipe(
        map(species => species.results)).pipe(
        tap(taxa => InvasiveComponent.taxa = taxa));
    }
  }

  updateObservations() {
    this.warehouseApi.warehouseQueryAggregateGet(
      this.invasiveQuery,
      ['unit.linkings.taxon.id'],
      undefined,
      undefined,
      undefined,
      undefined,
      false
    ).pipe(
      map(data => data.results))
      .subscribe(data => {
        data.map(item => {
          item.isNew = moment(item.oldestRecord) > this.daysBack;
          item.isNewThisYear = moment(item.newestRecord) > this.daysBack;
          this.aggr[IdService.getId(item['aggregateBy']['unit.linkings.taxon.id'])] = item;
        });
      });
  }

  showLatestDocument(taxonID) {
    this.warehouseApi.warehouseQueryListGet({...this.invasiveQuery, taxonId: taxonID}, ['document.documentId', 'unit.unitId'], undefined, 1)
      .pipe(map(data => data.results[0]))
      .subscribe(result => {
        this.documentViewerFacade.showDocumentID({
          document: result.document && result.document.documentId || '',
          highlight: result.unit && result.unit.unitId || '',
          openAnnotation: false,
          result: undefined
        });
      });
  }
}
