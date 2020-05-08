import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

type Role = 'contentinfo' | 'alert' | 'parenthetic';

@Component({
  selector: 'lu-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent implements OnInit {

  @Input() role: Role = 'contentinfo';
  @Input() title = '';
  @Input() class = '';

  constructor() { }

  ngOnInit() {
  }

}
