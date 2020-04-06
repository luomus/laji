import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lu-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent implements OnInit {

  @Input() type: 'close' | 'menu';

  constructor() { }

  ngOnInit() {
  }

}
