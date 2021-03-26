import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IUserLetterTaxonStatistics } from '../../models';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from '../../../../shared/service/triplestore-label.service';
import { Subscription } from 'rxjs';

interface ILetterResultTableRow extends IUserLetterTaxonStatistics {
  species?: string;
}

@Component({
  selector: 'laji-kerttu-letter-result-table',
  templateUrl: './kerttu-letter-result-table.component.html',
  styleUrls: ['./kerttu-letter-result-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuLetterResultTableComponent implements OnDestroy {
  columns: DatatableColumn[] = [
    {
      name: 'species',
      label: 'theme.kerttu.result.species',
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
  _data: ILetterResultTableRow[] = [];

  loading = false;

  @Input() set data(data: IUserLetterTaxonStatistics[]) {
    this._data = [...data];
    this.updateSpecies();
  }

  private nameSub: Subscription;

  constructor(
    private translate: TranslateService,
    private triplestoreLabelService: TriplestoreLabelService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnDestroy() {
    if (this.nameSub) {
      this.nameSub.unsubscribe();
    }
  }

  updateSpecies() {
    if (this.nameSub) {
      this.nameSub.unsubscribe();
    }
    const ids = this._data.map(d => d.taxonId);
    if (ids.length < 1) {
      return;
    }

    this.loading = true;
    this.nameSub = this.triplestoreLabelService.getAll(ids, this.translate.currentLang).subscribe(res => {
      this._data.forEach(d => { d.species = res[d.taxonId]; });
      this._data = [...this._data];
      this.loading = false;
      this.cd.markForCheck();
    });
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
