import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'laji-tool-success',
  templateUrl: './tool-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolSuccessComponent implements OnInit {

  @Input() success = false;

  constructor() { }

  ngOnInit() {
  }

}
