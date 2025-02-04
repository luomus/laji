import { AfterViewInit, Component, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { LappiStatsResponseGridsElement } from '../../core/atlas-api.service';
import { TableColumn } from '@achimha/ngx-datatable';

@Component({
  templateUrl: './lappi-modal.component.html',
  styleUrls: ['./lappi-modal.component.scss']
})
export class LappiModalComponent implements AfterViewInit {
  @ViewChild('YKJ') ykjTemplate!: TemplateRef<any>;
  @ViewChild('alignRight') alignRightTemplate!: TemplateRef<any>;

  rows: LappiStatsResponseGridsElement[] = [];
  cols!: TableColumn[];
  index: number | undefined;
  hideModal = new EventEmitter<null>();

  ngAfterViewInit() {
    this.cols = [
      {
        prop: 'coordinates',
        name: 'YKJ',
        resizeable: false,
        sortable: true,
        cellTemplate: this.ykjTemplate
      },
      {
        prop: 'name',
        name: 'Nimi',
        resizeable: false,
        sortable: true,
      },
      {
        prop: 'atlasClassSum',
        name: 'Pesimävarmuussumma',
        resizeable: false,
        sortable: true,
        maxWidth: 150,
        cellTemplate: this.alignRightTemplate
      },
      {
        prop: 'activityCategory.value',
        name: 'Selvitysaste',
        resizeable: false,
        sortable: true,
      },
    ];
  }

  onLinkClick() {
    this.hideModal.next();
  }

  onCloseModal() {
    this.hideModal.next();
  }
}
