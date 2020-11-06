import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-facts',
  templateUrl: './facts.component.html',
  styleUrls: ['./facts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FactsComponent {

  @Input() show = false;
  @Input() facts: {fact: string, value: string}[];

  constructor() { }

}
