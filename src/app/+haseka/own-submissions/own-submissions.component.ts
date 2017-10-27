import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnSubmissionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
