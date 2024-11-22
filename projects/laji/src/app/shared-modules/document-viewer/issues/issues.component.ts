import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

const QUALITY_ERRORS = [
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
  hasIssue!: boolean;

  ngOnChanges() {
    this.initIssue();
  }

  initIssue() {
    if (!this.data || !this.data.quality) {
      this.hasIssue = false;
      return;
    }
    this.hasIssue = Object.keys(this.data.quality).filter(key => QUALITY_ERRORS.indexOf(key) > -1).length > 0;
  }

}
