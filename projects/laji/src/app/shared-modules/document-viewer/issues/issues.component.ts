import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

const QualityErrors = [
  'issue',
  'locationIssue',
  'timeIssue'
];

@Component({
  selector: 'laji-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssuesComponent implements OnChanges {

  @Input() data: any;
  @Input() hideTooltips = false;
  hasIssue: boolean;

  constructor() { }

  ngOnChanges() {
    this.initIssue();
  }

  initIssue() {
    if (!this.data || !this.data.quality) {
      this.hasIssue = false;
      return;
    }
    this.hasIssue = Object.keys(this.data.quality).filter(key => QualityErrors.indexOf(key) > -1).length > 0;
  }

}
