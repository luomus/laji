import { map, tap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { WarehouseApi } from '../../../../laji/src/app/shared/api/WarehouseApi';
import { IdService } from '../../../../laji/src/app/shared/service/id.service';
import { Observable, of as ObservableOf } from 'rxjs';
import * as moment from 'moment';
import { DocumentViewerFacade } from '../../../../laji/src/app/shared-modules/document-viewer/document-viewer.facade';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { TranslateService } from '@ngx-translate/core';

type Taxon = components['schemas']['Taxon'];

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

  static taxa: Taxon[];

  taxa!: Observable<Taxon[]>;
  aggr: {[key: string]: IAggregated} = {};
  daysBack;
  invasiveQuery = {
    countryId: ['ML.206'],
    administrativeStatusId: ['MX.euInvasiveSpeciesList']
  };

  constructor(
    private api: LajiApiClientBService,
    private warehouseApi: WarehouseApi,
    private documentViewerFacade: DocumentViewerFacade,
    private translate: TranslateService
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
      this.taxa = this.api.post('/taxa/{id}/species', {
        path:  { id: 'MX.37600' },
        query: { lang: this.translate.currentLang as any } },
        { administrativeStatuses: 'MX.euInvasiveSpeciesList'
      }).pipe(
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
        data.map((item: any) => {
          item.isNew = moment(item.oldestRecord) > this.daysBack;
          item.isNewThisYear = moment(item.newestRecord) > this.daysBack;
          this.aggr[IdService.getId(item['aggregateBy']['unit.linkings.taxon.id'])] = item;
        });
      });
  }

  showLatestDocument(taxonID: string) {
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
