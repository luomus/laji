import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/**
 * Usage
 *

<div *ngIf="content$ | async; else loading; let content" [innerHtml]="content"></div>
<ng-template #loading>
  <lu-ghost-paragraph [length]="10"></lu-ghost-paragraph>
  <lu-ghost-paragraph [length]="300"></lu-ghost-paragraph>
  <lu-ghost-paragraph [length]="200"></lu-ghost-paragraph>
</ng-template>

 */

@Component({
  selector: 'lu-ghost-paragraph',
  template: `
<p class="ghost">
  <span>{{ str }}</span>
</p>
  `,
  styleUrls: ['./ghost-paragraph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GhostParagraphComponent {
  _length = 0;
  str = '';

  @Input() set length(length: number) {
    this._length = length;
    this.str = ''.concat(...Array(length / 2).fill('a '));
  }
  get length() { return this._length; }
}
