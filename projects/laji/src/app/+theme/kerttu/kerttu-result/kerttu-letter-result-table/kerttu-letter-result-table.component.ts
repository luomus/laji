import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {IUserLetterTaxonStatistics} from '../../models';
import {DatatableColumn} from '../../../../shared-modules/datatable/model/datatable-column';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-letter-result-table',
  templateUrl: './kerttu-letter-result-table.component.html',
  styleUrls: ['./kerttu-letter-result-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuLetterResultTableComponent implements OnInit {
  @Input() data: IUserLetterTaxonStatistics[];

  columns: DatatableColumn[] = [
    {
      name: 'taxonId',
      label: 'theme.kerttu.result.species',
      cellTemplate: 'label',
      width: 100,
      summaryFunc: () => this.translate.instant('theme.total')
    },
    {
      name: 'userAnnotationCount',
      label: 'theme.kerttu.result.userAnnotationCount',
      width: 70
    },
    {
      name: 'commonAnnotationCount',
      label: 'theme.kerttu.result.commonAnnotationCount',
      width: 70
    },
    {
      name: 'similarity',
      label: 'theme.kerttu.result.similarity',
      cellTemplate: 'percentage',
      width: 70,
      summaryFunc: this.meanPercent
    },
    {
      name: 'identifiability',
      label: 'theme.kerttu.result.identifiability',
      cellTemplate: 'percentage',
      width: 70,
      summaryFunc: this.meanPercent
    }
  ];

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
  }

  meanPercent(data: number[]): string {
    const filtered = data.filter(d => d !== undefined);
    if (filtered.length === 0) {
      return '';
    }
    const sum = filtered.reduce((result, value) => result + value, 0);
    const mean = sum / filtered.length;
    return Math.round(mean * 1000) / 10 + ' %';
  }
}
