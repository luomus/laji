import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'vir-save-observations',
  templateUrl: './save-observations.component.html',
  styleUrls: ['./save-observations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveObservationsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
