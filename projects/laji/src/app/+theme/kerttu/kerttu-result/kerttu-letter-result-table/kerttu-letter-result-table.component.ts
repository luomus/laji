import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {IUserLetterTaxonStatistics} from '../../models';
import {DatatableColumn} from '../../../../shared-modules/datatable/model/datatable-column';

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
      width: 100
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
      width: 70
    },
    {
      name: 'identifiability',
      label: 'theme.kerttu.result.identifiability',
      cellTemplate: 'percentage',
      width: 70
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
