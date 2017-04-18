import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css']
})
export class OwnSubmissionsComponent implements OnInit {
  rows = [ { prop: 'abc' },
      { name: 'def'}];
  columns = [{abc: 'kesken'}, {def: 'nyt!'}];

  constructor() { }

  ngOnInit() {
  }

}
