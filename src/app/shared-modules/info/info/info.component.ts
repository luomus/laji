import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent implements OnInit {

  @Input() placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'left';

  constructor() { }

  ngOnInit() {
  }

}
