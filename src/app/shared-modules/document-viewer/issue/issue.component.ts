import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

export interface Issue {
  issue: string;
  message?: string;
  source?: string;
}

@Component({
  selector: 'laji-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueComponent implements OnChanges {

  @Input() issue: any;
  @Input() hideTooltip = false;
  error: Issue;

  constructor() { }

  ngOnChanges() {
    this.prepareIssue();
  }

  prepareIssue() {
    if (!this.issue) {
      return;
    }
    this.error = {
      issue: this.issue.issue || this.issue.reliability || '',
      message: this.issue.message || '',
      source: this.issue.source || ''
    };
  }

}
