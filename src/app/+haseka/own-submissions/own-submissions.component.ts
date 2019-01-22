import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'laji-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnSubmissionsComponent implements OnInit {

  constructor() { }

  isDev = environment.type === 'dev';

  ngOnInit() {
  }

}
