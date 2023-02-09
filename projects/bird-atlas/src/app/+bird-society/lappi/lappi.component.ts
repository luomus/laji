import { Component, OnDestroy } from '@angular/core';
import { AtlasApiService } from '../../core/atlas-api.service';
import { TableColumn } from '@swimlane/ngx-datatable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { map } from 'rxjs/operators';
import { LappiModalComponent } from './lappi-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ba-society-lappi',
  template: `
<div *ngIf="lappiStats$ | async; let stats; else loading" class="container">
  <img class="d-block mb-4" src="https://cdn.laji.fi/images/bird-society-lappi.png" alt="Suurruudut">
  <ngx-datatable
    class="material"
    [rows]="stats"
    [columns]="cols"
    [selectionType]="'single'"
    (select)="onTableRowSelect($event)"
  ></ngx-datatable>
</div>
<ng-template #loading>
  <div class="container"><laji-spinner class="d-block m-6"></laji-spinner></div>
</ng-template>
  `,
  styleUrls: ['./lappi.component.scss']
})
export class LappiSocietyComponent implements OnDestroy {
  lappiStats$ = this.atlasApi.getLappiStats().pipe(
    map(a => a.map((e, i) => (
      {
        ...e,
        index: i,
        ykjString: `${e.latMin}:${e.lonMin}-${e.latMax}:${e.lonMax}`,
        targetPercentage: `${Math.round(e.targetPercentage)}%`
      }
    )))
  );
  cols: TableColumn[];

  private bsModalRef: BsModalRef;
  private hideModalSubscription: Subscription;

  constructor(private atlasApi: AtlasApiService, private modalService: BsModalService) {
    this.cols = [
      {
        prop: 'index',
        name: 'Ruutu',
        resizeable: false,
        sortable: true,
        maxWidth: 75
      },
      {
        prop: 'grid',
        name: 'YKJ',
        resizeable: false,
        sortable: true
      },
      {
        prop: 'targetSquares',
        name: 'Tavoite',
        resizeable: false,
        sortable: true,
        maxWidth: 75
      },
      {
        prop: 'targetPercentage',
        name: 'Tyydyttävästi selvitetyt ruudut',
        resizeable: false,
        sortable: true,
        minWidth: 200
      },
    ];
  }

  onTableRowSelect(e) {
    this.hideModalSubscription?.unsubscribe();
    this.bsModalRef = this.modalService.show(LappiModalComponent, {class: 'modal-lg'});
    this.bsModalRef.content.rows = e.selected[0].grids;
    this.hideModalSubscription = this.bsModalRef.content.hideModal.subscribe(() => {
      this.bsModalRef.hide();
      this.hideModalSubscription?.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.hideModalSubscription?.unsubscribe();
  }
}
