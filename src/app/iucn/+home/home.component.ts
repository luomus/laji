import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ResultService } from '../iucn-shared/service/result.service';

@Component({
  selector: 'laji-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  constructor(public iucnService: ResultService) { }

}
