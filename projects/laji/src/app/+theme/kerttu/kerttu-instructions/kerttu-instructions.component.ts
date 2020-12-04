import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-kerttu-instructions',
  templateUrl: './kerttu-instructions.component.html',
  styleUrls: ['./kerttu-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuInstructionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
