import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AtlasApiService } from '../../core/atlas-api.service';
import { TableColumn } from '@swimlane/ngx-datatable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { map } from 'rxjs/operators';
import { LappiModalComponent } from './lappi-modal.component';
import { Subscription } from 'rxjs';
import { HeaderService } from 'projects/laji/src/app/shared/service/header.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ba-society-lappi',
  templateUrl: './lappi.component.html',
  styleUrls: ['./lappi.component.scss']
})
export class LappiSocietyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('linkCell') linkCellTemplate: TemplateRef<any>;
  @ViewChild('ykjCell') ykjCellTemplate: TemplateRef<any>;
  @ViewChild('percentageCell') percentageCellTemplate: TemplateRef<any>;

  lappiStats$ = this.atlasApi.getLappiStats().pipe(
    map(a => a.map((e, i) => (
      {
        ...e,
        index: i + 1,
        ykjString: `${e.latMin}:${e.lonMin}-${e.latMax}:${e.lonMax}`,
        targetMetString: e.targetMet ? 'saavutettu' : 'vajaa'
      }
    )))
  );
  cols: TableColumn[];
  round = Math.round;

  private bsModalRef: BsModalRef;
  private hideModalSubscription: Subscription;

  constructor(
    private atlasApi: AtlasApiService,
    private modalService: BsModalService,
    private headerService: HeaderService,
    private translate: TranslateService
  ) {}

  ngAfterViewInit(): void {
    this.cols = [
      {
        prop: 'index',
        name: '',
        resizeable: false,
        sortable: false,
        maxWidth: 50,
        cellTemplate: this.linkCellTemplate
      },
      {
        prop: 'index',
        name: 'Suurruutu',
        resizeable: false,
        sortable: true,
        maxWidth: 75
      },
      {
        prop: 'grid',
        name: 'YKJ',
        resizeable: false,
        sortable: true,
        cellTemplate: this.ykjCellTemplate
      },
      {
        prop: 'targetMetString',
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
        minWidth: 190,
        cellTemplate: this.percentageCellTemplate
      },
    ];
    this.headerService.setHeaders({
      title: `Pohjois-Lapin suurruudut | ${this.translate.instant('ba.header.title')}`
    });
  }

  onTableRowSelect(e) {
    this.hideModalSubscription?.unsubscribe();
    this.bsModalRef = this.modalService.show(LappiModalComponent, {class: 'modal-lg'});
    this.bsModalRef.content.rows = e.selected[0].grids;
    this.bsModalRef.content.index = e.selected[0].index;
    this.hideModalSubscription = this.bsModalRef.content.hideModal.subscribe(() => {
      this.bsModalRef.hide();
      this.hideModalSubscription?.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.hideModalSubscription?.unsubscribe();
  }
}