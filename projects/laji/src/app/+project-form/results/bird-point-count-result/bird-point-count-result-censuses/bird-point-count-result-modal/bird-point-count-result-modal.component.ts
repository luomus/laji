import { Observable, Subscription } from 'rxjs';
import { ColumnChangesService, DimensionsHelper, ScrollbarHelper } from '@achimha/ngx-datatable';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { BirdPointCountFact } from '../../bird-point-count-result.service';

@Component({
  selector: 'laji-bird-point-count-result-modal',
  templateUrl: './bird-point-count-result-modal.component.html',
  styleUrls: ['./bird-point-count-result-modal.component.scss'],
  providers: [ScrollbarHelper, DimensionsHelper, ColumnChangesService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdPointCountResultModalComponent implements OnInit {
  @Input({ required: true }) documentFacts$: Observable<BirdPointCountFact[]>;

  resultSub: Subscription;
  rows: any[];
  columns: DatatableColumn[] = [
    {
      name: 'vernacularName',
      label: 'result.unit.taxonVerbatim',
      cellTemplate: 'multiLang'
    },
    {
      name: 'pairCountInner',
      label: 'birdPointCount.stats.censuses.inner'
    },
    {
      name: 'pairCountOuter',
      label: 'birdPointCount.stats.censuses.outer',
    },
  ];
  selected: string[] = [
    'vernacularName',
    'pairCountInner',
    'pairCountOuter'
  ];
  height = 'calc(80vh - 100px)';
  loading = false;
  link?: string;

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initRows();
  }

  initRows() {
    if (this.resultSub) {
      this.resultSub.unsubscribe();
    }

    this.loading = true;
    this.resultSub = this.documentFacts$.subscribe((facts) => {
      this.link = facts[0]?.documentId;
      this.rows = facts;
      this.cd.markForCheck();
      this.loading = false;
    });
  }
}
