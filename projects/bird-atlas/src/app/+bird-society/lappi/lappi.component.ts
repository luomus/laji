import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AtlasApiService, LappiStatsResponseElement } from '../../core/atlas-api.service';
import { TableColumn } from '@achimha/ngx-datatable';
import { map } from 'rxjs/operators';
import { LappiModalComponent } from './lappi-modal.component';
import { Subscription } from 'rxjs';
import { HeaderService } from 'projects/laji/src/app/shared/service/header.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';

interface LappiTableRowData extends LappiStatsResponseElement {
  index: number;
  ykjString: string;
  targetMetString: string;
}

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
      <LappiTableRowData>{
        ...e,
        index: i + 1,
        ykjString: `${e.latMin}:${e.lonMin}-${e.latMax}:${e.lonMax}`,
        targetMetString: e.targetMet ? 'saavutettu' : 'vajaa'
      }
    )))
  );
  cols: TableColumn[];
  round = Math.round;

  private modalRef: ModalRef;
  private hideModalSubscription: Subscription;

  constructor(
    private atlasApi: AtlasApiService,
    private modalService: ModalService,
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
    this.modalRef = this.modalService.show(LappiModalComponent, {size: 'lg'});
    this.modalRef.content.rows = e.selected[0].grids;
    this.modalRef.content.index = e.selected[0].index;
    this.hideModalSubscription = this.modalRef.content.hideModal.subscribe(() => {
      this.modalRef.hide();
      this.hideModalSubscription?.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.hideModalSubscription?.unsubscribe();
  }

  onExportCsv(data: LappiTableRowData[]) {
    const cols = [
      'Suurruutu', 'Tyydyttävästi selvitetyt ruudut', 'YKJ-ruudun koordinaatit',
      'Nimi', 'Pesimävarmuussumma', 'Selvitysaste'
    ].join(',');

    const rows: string[] = [];
    data.forEach(bigSquare => {
      bigSquare.grids.forEach(smallSquare => {
        rows.push(
          [
            bigSquare.index, bigSquare.targetPercentage, smallSquare.coordinates,
            smallSquare.name, smallSquare.atlasClassSum, smallSquare.activityCategory.value
          ].join(',')
        );
      });
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + [cols, ...rows].join('\n'));
    window.open(encodedUri);
  }
}
