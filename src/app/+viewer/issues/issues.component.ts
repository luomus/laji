import { Component, Input, OnChanges, OnInit } from '@angular/core';

const QualityErrors = [
  'issue',
  'locationIssue',
  'timeIssue'
];

@Component({
  selector: 'laji-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent implements OnInit, OnChanges {

  @Input() data: any;
  hasIssue: boolean;

  constructor() { }

  ngOnInit() {
    this.initIssue();
  }

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
